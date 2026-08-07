import {
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";

export type IJsonValue = JsonValue;

function admitIJsonNumber(value: number, path: string): number {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${path} contains a non-finite number`);
  }
  if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
    throw new TypeError(`${path} contains an unsafe I-JSON integer`);
  }
  return Object.is(value, -0) ? 0 : value;
}

function assertUnicodeScalarString(value: string, path: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new TypeError(`${path} contains an unpaired high surrogate`);
      }
      index += 1;
      continue;
    }
    if (unit >= 0xdc00 && unit <= 0xdfff) {
      throw new TypeError(`${path} contains an unpaired low surrogate`);
    }
  }
}

function copyIJson(
  value: unknown,
  path: string,
  active: Set<object>,
): IJsonValue {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") {
    assertUnicodeScalarString(value, path);
    return value;
  }
  if (typeof value === "number") {
    return admitIJsonNumber(value, path);
  }
  if (typeof value !== "object") {
    throw new TypeError(`${path} is not an I-JSON value`);
  }
  if (active.has(value)) {
    throw new TypeError(`${path} contains a circular reference`);
  }
  active.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) {
        throw new TypeError(`${path} must use the intrinsic Array prototype`);
      }
      const descriptors = Object.getOwnPropertyDescriptors(value);
      const allowedKeys = new Set(["length"]);
      const result: IJsonValue[] = [];
      for (let index = 0; index < value.length; index += 1) {
        const key = String(index);
        allowedKeys.add(key);
        const descriptor = descriptors[key];
        if (
          descriptor === undefined ||
          !("value" in descriptor) ||
          descriptor.enumerable !== true
        ) {
          throw new TypeError(`${path}[${index}] is sparse or accessor-backed`);
        }
        result.push(copyIJson(descriptor.value, `${path}[${index}]`, active));
      }
      for (const key of Reflect.ownKeys(descriptors)) {
        if (typeof key !== "string" || !allowedKeys.has(key)) {
          throw new TypeError(`${path} contains a non-JSON array property`);
        }
      }
      return result;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must be a plain object`);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const result: Record<string, IJsonValue> = Object.create(null) as Record<
      string,
      IJsonValue
    >;
    for (const key of Reflect.ownKeys(descriptors)) {
      if (typeof key !== "string") {
        throw new TypeError(`${path} contains a symbol-keyed property`);
      }
      assertUnicodeScalarString(key, `${path} property name`);
      const descriptor = descriptors[key]!;
      if (!("value" in descriptor) || descriptor.enumerable !== true) {
        throw new TypeError(`${path}.${key} is non-enumerable or accessor-backed`);
      }
      result[key] = copyIJson(descriptor.value, `${path}.${key}`, active);
    }
    return result;
  } finally {
    active.delete(value);
  }
}

export function admitIJsonValue(value: unknown): Readonly<IJsonValue> {
  return deepFreeze(copyIJson(value, "$", new Set<object>()));
}

class StrictJsonParser {
  private offset = 0;

  public constructor(private readonly source: string) {}

  public parse(): Readonly<IJsonValue> {
    this.skipWhitespace();
    const value = this.parseValue("$");
    this.skipWhitespace();
    if (this.offset !== this.source.length) {
      throw new TypeError(`unexpected JSON token at byte ${this.offset}`);
    }
    return deepFreeze(value);
  }

  private parseValue(path: string): IJsonValue {
    this.skipWhitespace();
    const token = this.source[this.offset];
    switch (token) {
      case "{":
        return this.parseObject(path);
      case "[":
        return this.parseArray(path);
      case '"':
        return this.parseString(path);
      case "t":
        this.expectKeyword("true");
        return true;
      case "f":
        this.expectKeyword("false");
        return false;
      case "n":
        this.expectKeyword("null");
        return null;
      default:
        return this.parseNumber(path);
    }
  }

  private parseObject(path: string): IJsonValue {
    this.expectCharacter("{");
    const result: Record<string, IJsonValue> = Object.create(null) as Record<
      string,
      IJsonValue
    >;
    const names = new Set<string>();
    this.skipWhitespace();
    if (this.takeCharacter("}")) return result;
    while (true) {
      this.skipWhitespace();
      if (this.source[this.offset] !== '"') {
        throw new TypeError(`expected JSON property name at byte ${this.offset}`);
      }
      const name = this.parseString(`${path} property name`);
      if (names.has(name)) {
        throw new TypeError(`${path} contains duplicate property ${JSON.stringify(name)}`);
      }
      names.add(name);
      this.skipWhitespace();
      this.expectCharacter(":");
      result[name] = this.parseValue(`${path}.${name}`);
      this.skipWhitespace();
      if (this.takeCharacter("}")) return result;
      this.expectCharacter(",");
      this.skipWhitespace();
      if (this.source[this.offset] === "}") {
        throw new TypeError(`${path} contains a trailing comma`);
      }
    }
  }

  private parseArray(path: string): IJsonValue {
    this.expectCharacter("[");
    const result: IJsonValue[] = [];
    this.skipWhitespace();
    if (this.takeCharacter("]")) return result;
    while (true) {
      result.push(this.parseValue(`${path}[${result.length}]`));
      this.skipWhitespace();
      if (this.takeCharacter("]")) return result;
      this.expectCharacter(",");
      this.skipWhitespace();
      if (this.source[this.offset] === "]") {
        throw new TypeError(`${path} contains a trailing comma`);
      }
    }
  }

  private parseString(path: string): string {
    const start = this.offset;
    this.expectCharacter('"');
    let escaped = false;
    while (this.offset < this.source.length) {
      const character = this.source[this.offset]!;
      this.offset += 1;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\") {
        escaped = true;
        continue;
      }
      if (character === '"') {
        const token = this.source.slice(start, this.offset);
        let value: unknown;
        try {
          value = JSON.parse(token) as unknown;
        } catch {
          throw new TypeError(`invalid JSON string at byte ${start}`);
        }
        if (typeof value !== "string") {
          throw new TypeError(`invalid JSON string at byte ${start}`);
        }
        assertUnicodeScalarString(value, path);
        return value;
      }
    }
    throw new TypeError(`unterminated JSON string at byte ${start}`);
  }

  private parseNumber(path: string): number {
    const remainder = this.source.slice(this.offset);
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/u.exec(remainder);
    if (match === null) {
      throw new TypeError(`expected JSON value at byte ${this.offset}`);
    }
    this.offset += match[0].length;
    return admitIJsonNumber(Number(match[0]), path);
  }

  private expectKeyword(keyword: string): void {
    if (this.source.slice(this.offset, this.offset + keyword.length) !== keyword) {
      throw new TypeError(`expected ${keyword} at byte ${this.offset}`);
    }
    this.offset += keyword.length;
  }

  private expectCharacter(character: string): void {
    if (!this.takeCharacter(character)) {
      throw new TypeError(`expected ${character} at byte ${this.offset}`);
    }
  }

  private takeCharacter(character: string): boolean {
    if (this.source[this.offset] !== character) return false;
    this.offset += 1;
    return true;
  }

  private skipWhitespace(): void {
    while (
      this.source[this.offset] === " " ||
      this.source[this.offset] === "\n" ||
      this.source[this.offset] === "\r" ||
      this.source[this.offset] === "\t"
    ) {
      this.offset += 1;
    }
  }
}

export function admitIJsonText(source: string): Readonly<IJsonValue> {
  if (typeof source !== "string") {
    throw new TypeError("I-JSON text admission requires a string");
  }
  return new StrictJsonParser(source).parse();
}

export function serializeIJsonCanonical(value: unknown): string {
  return canonicalJson(admitIJsonValue(value));
}
