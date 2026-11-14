/**
 * Diagnostic text only (T-293 B12). Each UTF-16 code unit of `text` that is not
 * one half of a well-formed surrogate pair (a lone surrogate) is written as the
 * literal six-character escape `\uXXXX`, in the lowercase hexadecimal spelling
 * `JSON.stringify` uses, so the offending code unit value stays readable and
 * the rendered text is a sequence of Unicode scalar values that `admitJson`
 * admits. Every other character, supplementary characters included, is kept
 * unchanged, and text without a lone surrogate is returned as the same string,
 * so an ordinary message is unchanged and rendering is idempotent.
 *
 * It renders a fault message, an exception or Effect cause, or a transport
 * fallback message. It is not a semantic-data boundary: an owner refuses
 * malformed semantic data and never sanitizes it here.
 */
export function renderDiagnosticText(text: string): string {
  let rendered = "";
  let copied = 0;
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    if (unit < 0xd800 || unit > 0xdfff) continue;
    if (unit < 0xdc00) {
      const next = text.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
        continue;
      }
    }
    rendered += `${text.slice(copied, index)}\\u${unit.toString(16)}`;
    copied = index + 1;
  }
  return copied === 0 ? text : rendered + text.slice(copied);
}
