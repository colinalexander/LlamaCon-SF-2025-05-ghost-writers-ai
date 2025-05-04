# Llama API — Chat Completion (Preview)

## 1. Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| **POST** | `/v1/chat/completions` | Generate a chat completion (optionally streamed) with a Llama model |

---

## 2. Request Body (`application/json`)

| Field | Type | Required | Description | Default / Limits |
|-------|------|----------|-------------|------------------|
| `model` | *string* | **Yes** | Identifier of the Llama model to use | — |
| `messages` | *array&lt;Message&gt;* | **Yes** | Conversation history | — |
| `tools` | *array&lt;ToolDefinition&gt;* | No | Tools the model may call | — |
| `response_format` | `{ "type": "text" \| "json_schema", ... }` | No | Force free-text or structured JSON output | `{ "type": "text" }` |
| `stream` | *boolean* | No | If `true`, return an SSE stream | `false` |
| `repetition_penalty` | *number* | No | Penalize repetition (1–2) | `1` |
| `temperature` | *number* | No | Creativity (0–1) | `0.6` |
| `top_p` | *number* | No | Nucleus-sampling cutoff (0–1) | `0.9` |
| `top_k` | *integer* | No | Sample only from the top-*k* tokens | — |
| `max_completion_tokens` | *integer* | No | Cap on tokens generated | `4096` (min 1) |

### Message object variants

```jsonc
// User-supplied messages
{ "role": "user",      "content": "..." }

// System instructions
{ "role": "system",    "content": "..." }

// Assistant replies
{ "role": "assistant", "content": "..." }

// Tool result (when using tool calling)
{ "role": "tool", "tool_call_id": "...", "content": "..." }
```

### Tool definition schema

```json
{
  "name": "tool_name",
  "description": "Brief description",
  "parameters": { /* JSON‑Schema */ }
}
```

---

## 3. Response (`application/json`)

| When | Returns |
|------|---------|
| `stream = false` | `CreateChatCompletionResponse`<br>• `completion_message` – assistant reply<br>• `metrics` – (optional) generation stats |
| `stream = true`  | `text/event-stream` of `CreateChatCompletionResponseStreamChunk` events |

---

## 4. Example Requests

### a) Text chat completion

```bash
curl -X POST https://api.llama.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LLAMA_API_KEY" \
  -d '{
    "model": "Llama-4-Maverick-17B-128E-Instruct-FP8",
    "messages": [
      { "role": "user", "content": "Hello, how are you?" }
    ],
    "max_completion_tokens": 1024,
    "temperature": 0.7
  }'
```

### b) Image understanding

```bash
curl -X POST https://api.llama.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LLAMA_API_KEY" \
  -d '{
    "model": "Llama-4-Maverick-17B-128E-Instruct-FP8",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "What do these two images have in common?" },
          { "type": "image_url", "image_url": { "url": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Lama_glama_Laguna_Colorada_2.jpg" } },
          { "type": "image_url", "image_url": { "url": "https://upload.wikimedia.org/wikipedia/commons/1/12/Llamas%2C_Laguna_Munilu_y_Nevado_Huayna_Potosí_(La_Paz_-_Bolivia).jpg" } }
        ]
      }
    ]
  }'
```

---

## 5. Production Notes
* The API is **preview**‑only; endpoints and parameters may change.  
* For advanced usage—tool calling, structured output, streaming, and image inputs—see the **Chat & Conversation Guide**.  
* Tune `temperature`, `top_p`, `top_k`, and `repetition_penalty` to balance creativity, determinism, and safety.

---

*Generated for LLM consumption; copy or embed as needed.*
