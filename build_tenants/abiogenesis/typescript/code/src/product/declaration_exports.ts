interface DeclarationToken {
  readonly kind: "identifier" | "literal" | "punctuator";
  readonly text: string;
}

function isIdentifierStart(character: string): boolean {
  return /[A-Za-z_$]/u.test(character);
}

function isIdentifierPart(character: string): boolean {
  return /[A-Za-z0-9_$]/u.test(character);
}

function skipQuoted(
  source: string,
  start: number,
  quote: "'" | "\"",
): number | null {
  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index]!;
    if (character === "\\") {
      index += 1;
      continue;
    }
    if (character === quote) return index + 1;
    if (character === "\n" || character === "\r") return null;
  }
  return null;
}

function skipLineComment(source: string, start: number): number {
  let index = start + 2;
  while (
    index < source.length &&
    source[index] !== "\n" &&
    source[index] !== "\r"
  ) {
    index += 1;
  }
  return index;
}

function skipBlockComment(source: string, start: number): number | null {
  const end = source.indexOf("*/", start + 2);
  return end < 0 ? null : end + 2;
}

function skipTemplateExpression(source: string, start: number): number | null {
  let depth = 1;
  for (let index = start; index < source.length;) {
    const character = source[index]!;
    const next = source[index + 1];
    if (character === "'" || character === "\"") {
      const end = skipQuoted(source, index, character);
      if (end === null) return null;
      index = end;
      continue;
    }
    if (character === "`") {
      const end = skipTemplate(source, index);
      if (end === null) return null;
      index = end;
      continue;
    }
    if (character === "/" && next === "/") {
      index = skipLineComment(source, index);
      continue;
    }
    if (character === "/" && next === "*") {
      const end = skipBlockComment(source, index);
      if (end === null) return null;
      index = end;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
    index += 1;
  }
  return null;
}

function skipTemplate(source: string, start: number): number | null {
  for (let index = start + 1; index < source.length;) {
    const character = source[index]!;
    if (character === "\\") {
      index += 2;
      continue;
    }
    if (character === "`") return index + 1;
    if (character === "$" && source[index + 1] === "{") {
      const end = skipTemplateExpression(source, index + 2);
      if (end === null) return null;
      index = end;
      continue;
    }
    index += 1;
  }
  return null;
}

function tokenizeDeclaration(source: string): readonly DeclarationToken[] | null {
  const tokens: DeclarationToken[] = [];
  for (let index = 0; index < source.length;) {
    const character = source[index]!;
    const next = source[index + 1];
    if (/\s/u.test(character)) {
      index += 1;
      continue;
    }
    if (character === "/" && next === "/") {
      index = skipLineComment(source, index);
      continue;
    }
    if (character === "/" && next === "*") {
      const end = skipBlockComment(source, index);
      if (end === null) return null;
      index = end;
      continue;
    }
    if (character === "'" || character === "\"") {
      const end = skipQuoted(source, index, character);
      if (end === null) return null;
      tokens.push({ kind: "literal", text: source.slice(index, end) });
      index = end;
      continue;
    }
    if (character === "`") {
      const end = skipTemplate(source, index);
      if (end === null) return null;
      tokens.push({ kind: "literal", text: source.slice(index, end) });
      index = end;
      continue;
    }
    if (isIdentifierStart(character)) {
      let end = index + 1;
      while (end < source.length && isIdentifierPart(source[end]!)) {
        end += 1;
      }
      tokens.push({ kind: "identifier", text: source.slice(index, end) });
      index = end;
      continue;
    }
    if (/[0-9]/u.test(character)) {
      let end = index + 1;
      while (end < source.length && /[A-Za-z0-9._]/u.test(source[end]!)) {
        end += 1;
      }
      tokens.push({ kind: "literal", text: source.slice(index, end) });
      index = end;
      continue;
    }
    tokens.push({ kind: "punctuator", text: character });
    index += 1;
  }
  return tokens;
}

function addExportClauseSymbols(
  tokens: readonly DeclarationToken[],
  start: number,
  symbols: Set<string>,
): void {
  let index = start + 1;
  while (index < tokens.length && tokens[index]!.text !== "}") {
    if (tokens[index]!.text === ",") {
      index += 1;
      continue;
    }
    if (tokens[index]!.text === "type") index += 1;
    const sourceName = tokens[index];
    if (sourceName?.kind !== "identifier") {
      index += 1;
      continue;
    }
    index += 1;
    let exportedName = sourceName.text;
    if (
      tokens[index]?.text === "as" &&
      tokens[index + 1]?.kind === "identifier"
    ) {
      exportedName = tokens[index + 1]!.text;
      index += 2;
    }
    symbols.add(exportedName);
    while (
      index < tokens.length &&
      tokens[index]!.text !== "," &&
      tokens[index]!.text !== "}"
    ) {
      index += 1;
    }
  }
}

function addVariableSymbols(
  tokens: readonly DeclarationToken[],
  start: number,
  symbols: Set<string>,
): void {
  let index = start;
  let expectingName = true;
  let angleDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  while (index < tokens.length) {
    const token = tokens[index]!;
    if (
      expectingName &&
      token.kind === "identifier"
    ) {
      symbols.add(token.text);
      expectingName = false;
      index += 1;
      continue;
    }
    if (token.text === "<") angleDepth += 1;
    if (token.text === ">" && angleDepth > 0) angleDepth -= 1;
    if (token.text === "{") braceDepth += 1;
    if (token.text === "}" && braceDepth > 0) braceDepth -= 1;
    if (token.text === "[") bracketDepth += 1;
    if (token.text === "]" && bracketDepth > 0) bracketDepth -= 1;
    if (token.text === "(") parenthesisDepth += 1;
    if (token.text === ")" && parenthesisDepth > 0) parenthesisDepth -= 1;
    const atVariableLevel =
      angleDepth === 0 &&
      braceDepth === 0 &&
      bracketDepth === 0 &&
      parenthesisDepth === 0;
    if (atVariableLevel && token.text === ";") return;
    if (atVariableLevel && token.text === ",") expectingName = true;
    index += 1;
  }
}

function addExportSymbols(
  tokens: readonly DeclarationToken[],
  exportIndex: number,
  symbols: Set<string>,
): void {
  let index = exportIndex + 1;
  while (
    tokens[index]?.text === "declare" ||
    tokens[index]?.text === "abstract" ||
    tokens[index]?.text === "async"
  ) {
    index += 1;
  }
  if (tokens[index]?.text === "default") {
    symbols.add("default");
    return;
  }
  if (tokens[index]?.text === "*") {
    if (
      tokens[index + 1]?.text === "as" &&
      tokens[index + 2]?.kind === "identifier"
    ) {
      symbols.add(tokens[index + 2]!.text);
    }
    return;
  }
  if (tokens[index]?.text === "type" && tokens[index + 1]?.text === "{") {
    index += 1;
  } else if (tokens[index]?.text === "type") {
    if (tokens[index + 1]?.kind === "identifier") {
      symbols.add(tokens[index + 1]!.text);
    }
    return;
  }
  if (tokens[index]?.text === "{") {
    addExportClauseSymbols(tokens, index, symbols);
    return;
  }
  if (
    tokens[index]?.text === "const" ||
    tokens[index]?.text === "let" ||
    tokens[index]?.text === "var"
  ) {
    addVariableSymbols(tokens, index + 1, symbols);
    return;
  }
  if (
    tokens[index]?.text === "class" ||
    tokens[index]?.text === "enum" ||
    tokens[index]?.text === "function" ||
    tokens[index]?.text === "interface" ||
    tokens[index]?.text === "module" ||
    tokens[index]?.text === "namespace" ||
    tokens[index]?.text === "import"
  ) {
    if (tokens[index + 1]?.kind === "identifier") {
      symbols.add(tokens[index + 1]!.text);
    }
    return;
  }
  if (tokens[index]?.text === "=") symbols.add("default");
}

export function declarationExportSymbols(
  bytes: Uint8Array,
): ReadonlySet<string> | null {
  const tokens = tokenizeDeclaration(new TextDecoder().decode(bytes));
  if (tokens === null) return null;
  const symbols = new Set<string>();
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let declarationBoundary = true;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;
    const atTopLevel =
      braceDepth === 0 &&
      bracketDepth === 0 &&
      parenthesisDepth === 0;
    if (
      atTopLevel &&
      declarationBoundary &&
      token.kind === "identifier" &&
      token.text === "export"
    ) {
      addExportSymbols(tokens, index, symbols);
      declarationBoundary = false;
    } else if (atTopLevel && token.text === ";") {
      declarationBoundary = true;
    } else if (atTopLevel && declarationBoundary) {
      declarationBoundary = false;
    }

    if (token.text === "{") braceDepth += 1;
    if (token.text === "}") {
      braceDepth -= 1;
      if (braceDepth < 0) return null;
      if (braceDepth === 0 && bracketDepth === 0 && parenthesisDepth === 0) {
        declarationBoundary = true;
      }
    }
    if (token.text === "[") bracketDepth += 1;
    if (token.text === "]") {
      bracketDepth -= 1;
      if (bracketDepth < 0) return null;
    }
    if (token.text === "(") parenthesisDepth += 1;
    if (token.text === ")") {
      parenthesisDepth -= 1;
      if (parenthesisDepth < 0) return null;
    }
  }
  return braceDepth === 0 && bracketDepth === 0 && parenthesisDepth === 0
    ? symbols
    : null;
}
