/*
 * ABIogenesis physical-path metadata observer (T-293 B21 / RC14).
 *
 * Supplies read-only Darwin metadata for an already-open descriptor and the
 * current mount population. TypeScript keeps descriptor custody, comparison
 * and refusal meaning. This module holds no policy, event authority, retained
 * filesystem state, write or child process. Explicit target: Darwin arm64,
 * Node-API 8.
 */
#define NAPI_VERSION 8

#if !defined(__APPLE__) || !defined(__aarch64__)
#error "abg_physical_path supports only the explicit Darwin arm64 target"
#endif

#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mount.h>
#include <sys/param.h>
#include <node_api.h>

#define ABG_PHYSICAL_PATH_ABI "abg-physical-path/1"
#define ABG_MOUNT_POPULATION_LIMIT 4096

static const char *errno_name(int code) {
  switch (code) {
    case EACCES: return "EACCES";
    case EBADF: return "EBADF";
    case EFAULT: return "EFAULT";
    case EINVAL: return "EINVAL";
    case EIO: return "EIO";
    case ENAMETOOLONG: return "ENAMETOOLONG";
    case ENOENT: return "ENOENT";
    case ENOMEM: return "ENOMEM";
    case ENOSPC: return "ENOSPC";
    case ENOTDIR: return "ENOTDIR";
    case ENOTSUP: return "ENOTSUP";
    case EPERM: return "EPERM";
    case ERANGE: return "ERANGE";
    default: return "EPHYSICALPATH";
  }
}

/* Throws one Error carrying a stable code and the numeric errno. */
static napi_value throw_errno(napi_env env, const char *operation, int code) {
  napi_value message;
  napi_value code_value;
  napi_value errno_value;
  napi_value error;
  char text[160];
  bool pending = false;
  if (napi_is_exception_pending(env, &pending) == napi_ok && pending) return NULL;
  snprintf(text, sizeof text, "%s failed: %s (%d)", operation, errno_name(code), code);
  if (napi_create_string_utf8(env, text, NAPI_AUTO_LENGTH, &message) != napi_ok ||
      napi_create_string_utf8(env, errno_name(code), NAPI_AUTO_LENGTH, &code_value) != napi_ok ||
      napi_create_error(env, code_value, message, &error) != napi_ok) {
    napi_throw_error(env, "EPHYSICALPATH", "native physical-path error construction failed");
    return NULL;
  }
  if (napi_create_int32(env, code, &errno_value) == napi_ok) {
    napi_set_named_property(env, error, "errno", errno_value);
  }
  napi_throw(env, error);
  return NULL;
}

static napi_value throw_type(napi_env env, const char *text) {
  napi_throw_type_error(env, "EINVAL", text);
  return NULL;
}

static bool descriptor_argument(napi_env env, napi_callback_info info, int *fd) {
  size_t argc = 1;
  napi_value argv[1];
  napi_valuetype type;
  int32_t value;
  if (napi_get_cb_info(env, info, &argc, argv, NULL, NULL) != napi_ok || argc != 1 ||
      napi_typeof(env, argv[0], &type) != napi_ok || type != napi_number ||
      napi_get_value_int32(env, argv[0], &value) != napi_ok || value < 0) {
    throw_type(env, "expected one non-negative descriptor");
    return false;
  }
  *fd = value;
  return true;
}

/* Bytes up to the first NUL inside a fixed kernel field, never beyond it. */
static bool fixed_bytes(napi_env env, const char *field, size_t capacity, napi_value *result) {
  size_t length = strnlen(field, capacity);
  if (length >= capacity) return false;
  return napi_create_buffer_copy(env, length, field, NULL, result) == napi_ok;
}

static bool set_uint32(napi_env env, napi_value object, const char *name, uint32_t value) {
  napi_value number;
  return napi_create_uint32(env, value, &number) == napi_ok &&
    napi_set_named_property(env, object, name, number) == napi_ok;
}

static bool set_value(napi_env env, napi_value object, const char *name, napi_value value) {
  return napi_set_named_property(env, object, name, value) == napi_ok;
}

/* Identity/topology fields only; space and file counters are not topology. */
static bool mount_record(napi_env env, const struct statfs *record, napi_value *result) {
  napi_value object;
  napi_value fsid;
  napi_value fsid0;
  napi_value fsid1;
  napi_value fstypename;
  napi_value mntonname;
  napi_value mntfromname;
  if (napi_create_object(env, &object) != napi_ok ||
      napi_create_array_with_length(env, 2, &fsid) != napi_ok ||
      napi_create_uint32(env, (uint32_t)record->f_fsid.val[0], &fsid0) != napi_ok ||
      napi_create_uint32(env, (uint32_t)record->f_fsid.val[1], &fsid1) != napi_ok ||
      napi_set_element(env, fsid, 0, fsid0) != napi_ok ||
      napi_set_element(env, fsid, 1, fsid1) != napi_ok ||
      !fixed_bytes(env, record->f_fstypename, sizeof record->f_fstypename, &fstypename) ||
      !fixed_bytes(env, record->f_mntonname, sizeof record->f_mntonname, &mntonname) ||
      !fixed_bytes(env, record->f_mntfromname, sizeof record->f_mntfromname, &mntfromname) ||
      !set_value(env, object, "fsid", fsid) ||
      !set_uint32(env, object, "type", record->f_type) ||
      !set_uint32(env, object, "subtype", record->f_fssubtype) ||
      !set_uint32(env, object, "flags", record->f_flags) ||
      !set_uint32(env, object, "flagsExt", record->f_flags_ext) ||
      !set_uint32(env, object, "owner", (uint32_t)record->f_owner) ||
      !set_value(env, object, "fstypename", fstypename) ||
      !set_value(env, object, "mntonname", mntonname) ||
      !set_value(env, object, "mntfromname", mntfromname)) {
    return false;
  }
  *result = object;
  return true;
}

/* fcntl(F_GETPATH_NOFIRMLINK): the descriptor's path without firmlinks. */
static napi_value backing_path(napi_env env, napi_callback_info info) {
  int fd;
  char path[MAXPATHLEN];
  size_t length;
  napi_value result;
  if (!descriptor_argument(env, info, &fd)) return NULL;
  memset(path, 0, sizeof path);
  if (fcntl(fd, F_GETPATH_NOFIRMLINK, path) == -1) return throw_errno(env, "F_GETPATH_NOFIRMLINK", errno);
  length = strnlen(path, sizeof path);
  if (length == 0 || length >= sizeof path || path[0] != '/') return throw_errno(env, "F_GETPATH_NOFIRMLINK", EINVAL);
  if (napi_create_buffer_copy(env, length, path, NULL, &result) != napi_ok) return throw_errno(env, "F_GETPATH_NOFIRMLINK", ENOMEM);
  return result;
}

/* fstatfs: the mount record of the volume holding an open descriptor. */
static napi_value descriptor_mount(napi_env env, napi_callback_info info) {
  int fd;
  struct statfs record;
  napi_value result;
  if (!descriptor_argument(env, info, &fd)) return NULL;
  memset(&record, 0, sizeof record);
  if (fstatfs(fd, &record) == -1) return throw_errno(env, "fstatfs", errno);
  if (!mount_record(env, &record, &result)) return throw_errno(env, "fstatfs", ERANGE);
  return result;
}

/*
 * getfsstat(MNT_NOWAIT), bounded: one count probe, then one read into
 * count + 1 slots. A filled buffer is reported incomplete; no retry occurs.
 * MNT_NOWAIT returns cached records without contacting network volumes.
 */
static napi_value mount_population(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value argv[1];
  napi_valuetype type;
  int32_t limit;
  int probe;
  int capacity;
  int count;
  struct statfs *records;
  napi_value result;
  napi_value entries;
  napi_value complete;
  napi_value probe_value;
  napi_value count_value;
  if (napi_get_cb_info(env, info, &argc, argv, NULL, NULL) != napi_ok || argc != 1 ||
      napi_typeof(env, argv[0], &type) != napi_ok || type != napi_number ||
      napi_get_value_int32(env, argv[0], &limit) != napi_ok ||
      limit < 1 || limit > ABG_MOUNT_POPULATION_LIMIT) {
    return throw_type(env, "expected one bounded mount population limit");
  }
  probe = getfsstat(NULL, 0, MNT_NOWAIT);
  if (probe < 0) return throw_errno(env, "getfsstat", errno);
  if (napi_create_object(env, &result) != napi_ok ||
      napi_create_int32(env, probe, &probe_value) != napi_ok ||
      !set_value(env, result, "probeCount", probe_value)) {
    return throw_errno(env, "getfsstat", ENOMEM);
  }
  if (probe >= limit) {
    if (napi_get_boolean(env, false, &complete) != napi_ok ||
        napi_create_array_with_length(env, 0, &entries) != napi_ok ||
        napi_create_int32(env, 0, &count_value) != napi_ok ||
        !set_value(env, result, "complete", complete) ||
        !set_value(env, result, "count", count_value) ||
        !set_value(env, result, "entries", entries)) {
      return throw_errno(env, "getfsstat", ENOMEM);
    }
    return result;
  }
  capacity = probe + 1;
  records = calloc((size_t)capacity, sizeof *records);
  if (records == NULL) return throw_errno(env, "getfsstat", ENOMEM);
  count = getfsstat(records, (int)((size_t)capacity * sizeof *records), MNT_NOWAIT);
  if (count < 0) {
    int code = errno;
    free(records);
    return throw_errno(env, "getfsstat", code);
  }
  if (napi_get_boolean(env, count < capacity, &complete) != napi_ok ||
      napi_create_array_with_length(env, (size_t)count, &entries) != napi_ok ||
      napi_create_int32(env, count, &count_value) != napi_ok) {
    free(records);
    return throw_errno(env, "getfsstat", ENOMEM);
  }
  for (int index = 0; index < count; index += 1) {
    napi_value entry;
    if (!mount_record(env, &records[index], &entry) ||
        napi_set_element(env, entries, (uint32_t)index, entry) != napi_ok) {
      free(records);
      return throw_errno(env, "getfsstat", ERANGE);
    }
  }
  free(records);
  if (!set_value(env, result, "complete", complete) ||
      !set_value(env, result, "count", count_value) ||
      !set_value(env, result, "entries", entries)) {
    return throw_errno(env, "getfsstat", ENOMEM);
  }
  return result;
}

static bool export_function(napi_env env, napi_value exports, const char *name, napi_callback callback) {
  napi_value function;
  return napi_create_function(env, name, NAPI_AUTO_LENGTH, callback, NULL, &function) == napi_ok &&
    napi_set_named_property(env, exports, name, function) == napi_ok;
}

static bool export_string(napi_env env, napi_value object, const char *name, const char *text) {
  napi_value value;
  return napi_create_string_utf8(env, text, NAPI_AUTO_LENGTH, &value) == napi_ok &&
    napi_set_named_property(env, object, name, value) == napi_ok;
}

NAPI_MODULE_INIT() {
  napi_value target;
  if (napi_create_object(env, &target) != napi_ok ||
      !export_string(env, target, "platform", "darwin") ||
      !export_string(env, target, "arch", "arm64") ||
      !export_string(env, target, "abi", ABG_PHYSICAL_PATH_ABI) ||
      !set_uint32(env, target, "nodeApiVersion", NAPI_VERSION) ||
      !set_uint32(env, target, "mountPopulationLimit", ABG_MOUNT_POPULATION_LIMIT) ||
      napi_object_freeze(env, target) != napi_ok ||
      !set_value(env, exports, "target", target) ||
      !export_function(env, exports, "backingPath", backing_path) ||
      !export_function(env, exports, "descriptorMount", descriptor_mount) ||
      !export_function(env, exports, "mountPopulation", mount_population)) {
    napi_throw_error(env, "EPHYSICALPATH", "native physical-path module initialization failed");
    return NULL;
  }
  return exports;
}
