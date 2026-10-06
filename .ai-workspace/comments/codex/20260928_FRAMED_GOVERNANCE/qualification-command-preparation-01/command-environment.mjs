// External caller preparation. Imports, pure construction and file reads admit no ABG facts.
// This module never stages files, executes commands, obtains grants or resolves a tool.
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, isAbsolute, join, relative, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export async function fileSha256(path) {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(path)) digest.update(chunk);
  return digest.digest('hex');
}

const within = (root, path) => {
  const relation = relative(root, path);
  return relation === '' || (!isAbsolute(relation) && relation !== '..' && !relation.startsWith('../'));
};

export async function assertPinnedNode(pin) {
  if (!pin || !isAbsolute(pin.origin) || resolve(pin.origin) !== pin.origin ||
      !Number.isSafeInteger(pin.bytes) || pin.bytes <= 0 ||
      !/^[0-9a-f]{64}$/.test(pin.sha256) || !Number.isSafeInteger(pin.mode)) {
    throw new TypeError('explicit exact pinned Node coordinate required');
  }
  const stat = await fs.lstat(pin.origin);
  if (!stat.isFile() || await fs.realpath(pin.origin) !== pin.origin ||
      stat.size !== pin.bytes || (stat.mode & 0o777) !== pin.mode ||
      await fileSha256(pin.origin) !== pin.sha256) {
    throw new TypeError('pinned Node body/bytes/mode/canonical-origin mismatch');
  }
  return {origin: pin.origin, bytes: stat.size, sha256: pin.sha256,
    mode: stat.mode & 0o777, canonical: true, regularFile: true};
}

export async function assertToolWorkspaceSeparation({pin, workspaceAuthorityBasis, workspaceBinding}) {
  const root = workspaceAuthorityBasis?.canonicalRoot;
  const protectedRoots = workspaceBinding?.roots;
  if (!isAbsolute(root ?? '') || resolve(root) !== root || !protectedRoots ||
      workspaceBinding.workspaceId !== workspaceAuthorityBasis.workspaceId ||
      workspaceBinding.authorityBasisId !== workspaceAuthorityBasis.authorityBasisId ||
      workspaceBinding.authorityBasisDigest !== workspaceAuthorityBasis.authorityBasisDigest ||
      workspaceBinding.authorizedActorRef !== workspaceAuthorityBasis.authorizedActorRef) {
    throw new TypeError('exact explicit A/W root correspondence required');
  }
  const roots = [{role: 'worksite', path: root},
    ...Object.entries(protectedRoots).map(([role, path]) => ({role, path}))];
  for (const entry of roots) {
    if (!isAbsolute(entry.path) || resolve(entry.path) !== entry.path ||
        !(await fs.lstat(entry.path)).isDirectory() || await fs.realpath(entry.path) !== entry.path) {
      throw new TypeError('canonical existing original/protected root required: ' + entry.role);
    }
    if (within(entry.path, pin.origin) || within(dirname(pin.origin), entry.path)) {
      throw new TypeError('pinned tool origin/directory overlaps original or protected root: ' + entry.role);
    }
    // Match the existing owner's conservative textual exposure rule as well as containment.
    if (pin.origin.toLowerCase().includes(entry.path.toLowerCase())) {
      throw new TypeError('pinned tool origin text exposes original or protected root: ' + entry.role);
    }
  }
  return {toolOrigin: pin.origin, toolDirectory: dirname(pin.origin), checkedRoots: roots,
    outsideOriginalAndEveryProtectedRoot: true, runtimeAdmission: false};
}

export async function materializeCommandEnvironment({product, sourceConfig, pin,
  workspaceAuthorityBasis, workspaceBinding}) {
  const tool = await assertPinnedNode(pin);
  const separation = await assertToolWorkspaceSeparation({pin, workspaceAuthorityBasis, workspaceBinding});
  const configuration = structuredClone(sourceConfig);
  const path = [dirname(pin.origin), '/usr/bin', '/bin', '/usr/sbin', '/sbin'].join(':');
  if (path.split(':').some(entry => !isAbsolute(entry))) throw new TypeError('absolute fixed PATH required');
  const changedFields = [];
  for (const [ordinal, command] of configuration.commands.entries()) {
    if (!Array.isArray(command.environment) || command.environment.some(entry => entry.name === 'PATH_PREFIX')) {
      throw new TypeError('explicit environment array without PATH_PREFIX required');
    }
    const rows = command.environment.filter(entry => entry.name === 'PATH');
    if (rows.length !== 1 || !['toolchain/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        '.toolchain/bin:/usr/bin:/bin:/usr/sbin:/sbin'].includes(rows[0].value)) {
      throw new TypeError('unexpected inherited relative PATH declaration');
    }
    changedFields.push({ordinal, commandId: command.commandId,
      field: 'environment.PATH', before: rows[0].value, after: path});
    rows[0].value = path;
  }
  const withoutPathValues = value => ({...value, commands: value.commands.map(command => ({...command,
    environment: command.environment.map(entry => entry.name === 'PATH' ? {...entry, value: '<declared-PATH>'} : entry)}))});
  if (product.sha256Canonical(withoutPathValues(sourceConfig)) !==
      product.sha256Canonical(withoutPathValues(configuration))) {
    throw new TypeError('command meaning changed outside selected PATH adaptation');
  }
  return {configuration, binding: {kind: 'external_command_environment_binding', schemaVersion: '1',
    sourceConfigurationDigest: product.sha256Canonical(sourceConfig),
    configurationDigest: product.sha256Canonical(configuration), path, tool, separation, changedFields,
    ambientEnvironmentCaptured: false, commandExecution: false, runtimeAdmission: false}};
}

export async function constructPreparedObservedTask({product, preparation, pin,
  workspaceAuthorityBasis, workspaceBinding, capabilityGrant, selectedFiles}) {
  await assertPinnedNode(pin);
  await assertToolWorkspaceSeparation({pin, workspaceAuthorityBasis, workspaceBinding});
  const {configuration, binding} = preparation;
  const expectedPath = [dirname(pin.origin), '/usr/bin', '/bin', '/usr/sbin', '/sbin'].join(':');
  if (binding.configurationDigest !== product.sha256Canonical(configuration) || binding.path !== expectedPath ||
      product.sha256Canonical(binding.tool) !== product.sha256Canonical(await assertPinnedNode(pin)) ||
      configuration.commands.some(command => command.environment.filter(entry => entry.name === 'PATH').length !== 1 ||
        command.environment.find(entry => entry.name === 'PATH').value !== expectedPath)) {
    throw new TypeError('changed prepared configuration/environment/tool binding');
  }
  if (!Array.isArray(selectedFiles) || selectedFiles.length === 0 ||
      new Set(selectedFiles.map(row => row.target)).size !== selectedFiles.length) {
    throw new TypeError('complete unique selected input rows required');
  }
  const observedFiles = [];
  for (const row of selectedFiles) {
    const path = resolve(workspaceAuthorityBasis.canonicalRoot, row.target);
    if (!within(workspaceAuthorityBasis.canonicalRoot, path) ||
        relative(workspaceAuthorityBasis.canonicalRoot, path) !== row.target) {
      throw new TypeError('selected path escapes mechanical/admitted worksite');
    }
    const stat = await fs.lstat(path);
    if (!stat.isFile() || await fs.realpath(path) !== path || stat.size !== row.bytes ||
        (stat.mode & 0o777) !== row.mode || await fileSha256(path) !== row.sha256) {
      throw new TypeError('selected copied input body/bytes/mode/canonical-path mismatch: ' + row.target);
    }
    const subject = product.constructWorksiteSubject({workspaceAuthorityBasis, workspaceBinding,
      relativePath: row.target, subjectUri: pathToFileURL(path).href});
    const observation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
    if (observation.state !== 'file' || observation.byteLength !== row.bytes ||
        observation.fileDigest !== 'sha256:' + row.sha256) {
      throw new TypeError('actual published-owner observation mismatch: ' + row.target);
    }
    observedFiles.push({subject, observation});
  }
  const input = {workspaceAuthorityBasis, workspaceBinding, capabilityGrant, observedFiles,
    commands: configuration.commands, outcomePredicates: configuration.outcomePredicates,
    allowedWriteTerritories: configuration.allowedWriteTerritories};
  // The published complete constructor owns normalization internally. The config helpers
  // are not exports of ./product; this caller never imports their private module.
  const task = product.constructObservedWorksiteCommandExecutionTask(input);
  const taskConfiguration = {commands: task.commands, predicates: task.outcomePredicates,
    allowedWriteTerritories: task.allowedWriteTerritories};
  if (!product.isObservedWorksiteCommandExecutionTask(task) ||
      task.commands.length !== configuration.commands.length ||
      task.outcomePredicates.length !== configuration.outcomePredicates.length ||
      task.protectedObservations.length !== selectedFiles.length) {
    throw new TypeError('complete actual task/configuration owner correspondence failed');
  }
  return {input, normalized: taskConfiguration, task, digests: {
    commandConfigurationDigest: product.sha256Canonical(task.commands),
    predicateConfigurationDigest: product.sha256Canonical(task.outcomePredicates),
    writeTerritoriesDigest: product.sha256Canonical(task.allowedWriteTerritories)}};
}

export function proposedRecipeForConstructedTask({product, sourceRecipe, constructed}) {
  const recipe = {...structuredClone(sourceRecipe), ...constructed.digests};
  const exact = recipe.commandConfigurationDigest === product.sha256Canonical(constructed.task.commands) &&
    recipe.predicateConfigurationDigest === product.sha256Canonical(constructed.task.outcomePredicates) &&
    recipe.writeTerritoriesDigest === product.sha256Canonical(constructed.task.allowedWriteTerritories) &&
    product.sha256Canonical(recipe.commands.map(row => row.commandId)) ===
      product.sha256Canonical(constructed.task.commands.map(row => row.commandId));
  if (!exact) throw new TypeError('proposed recipe does not match complete constructed task');
  return {recipe, status: 'configuration_correspondence_only',
    claim: 'Successor must bind its actual adapted recipe body and all affected input/inventory digests before native dispatch; the copied Q04 recipe remains unchanged.',
    runtimeAdmission: false, qualification: false};
}
