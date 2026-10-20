// Mechanical local process fixture. Never calls a provider or a worksite tool.
const mode = process.env.T287_SUPERVISION_MODE;
process.stdin.resume();
process.stdin.on("end", () => {
  const emit = value => process.stdout.write(JSON.stringify(value) + "\n");
  if (mode === "archive") {
    process.stderr.write("retained diagnostic\n");
    process.stdout.write("retained output α\n");
    setInterval(() => {}, 1000);
  } else if (mode === "retries") {
    emit({ type: "system", subtype: "init" });
    const timer = setInterval(() => emit({ type: "system", subtype: "api_retry", attempt: 1, max_retries: 6 }), 30);
    setTimeout(() => { clearInterval(timer); }, 1000);
  } else {
    emit({ type: "system", subtype: "init" });
    setTimeout(() => {
      emit({ type: "stream_event", event: { type: "content_block_start", index: 0,
        content_block: { type: "tool_use", id: "toolu_partial", name: "Bash", input: {} } } });
      emit({ type: "stream_event", event: { type: "content_block_delta", index: 0,
        delta: { type: "input_json_delta", partial_json: '{"command":"true"}' } } });
      emit({ type: "assistant", message: { content: [{ type: "tool_use", id: "toolu_partial", name: "Bash", input: { command: "true" } }] } });
      emit({ type: "result", subtype: "success", result: '{"message":"Hello"}' });
    }, 240);
  }
});
