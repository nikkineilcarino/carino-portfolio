import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const testApiKey = "portfolio-provider-test-key";
const testModel = "portfolio-provider-test-model";
let qaClientSequence = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function listenOnAvailablePort(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not determine the local test server port.");
  }

  return address.port;
}

async function getAvailablePort() {
  const server = createServer();
  const port = await listenOnAvailablePort(server);
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => (error ? rejectClose(error) : resolveClose()));
  });
  return port;
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
  }

  return JSON.parse(body);
}

function createMockResponse(text, requestBody) {
  return {
    id: `resp_${Date.now()}`,
    object: "response",
    created_at: Math.floor(Date.now() / 1000),
    status: "completed",
    error: null,
    incomplete_details: null,
    instructions: requestBody.instructions,
    max_output_tokens: requestBody.max_output_tokens,
    model: requestBody.model,
    output: text
      ? [
          {
            id: `msg_${Date.now()}`,
            type: "message",
            status: "completed",
            role: "assistant",
            content: [
              {
                type: "output_text",
                text,
                annotations: [],
              },
            ],
          },
        ]
      : [],
    parallel_tool_calls: true,
    previous_response_id: null,
    reasoning: null,
    store: false,
    temperature: 1,
    text: { format: { type: "text" } },
    tool_choice: "auto",
    tools: [],
    top_p: 1,
    truncation: "disabled",
    usage: {
      input_tokens: 100,
      input_tokens_details: { cached_tokens: 0 },
      output_tokens: text ? 20 : 0,
      output_tokens_details: { reasoning_tokens: 0 },
      total_tokens: text ? 120 : 100,
    },
  };
}

function writeOpenAiStreamEvent(response, event) {
  response.write(`event: ${event.type}\n`);
  response.write(`data: ${JSON.stringify(event)}\n\n`);
}

function getMockAnswer(question) {
  if (question.includes("oversized provider output")) {
    return "Z".repeat(10_000);
  }

  if (question.includes("meeting starts at noon")) {
    return "The meeting will begin at noon.";
  }

  if (question.includes("JavaScript function that adds")) {
    return "```js\nfunction add(a, b) {\n  return a + b;\n}\n```";
  }

  if (question.includes("19 + 23")) {
    return "19 + 23 = 42.";
  }

  if (question.includes("Make that explanation shorter")) {
    return "Recursion repeats on smaller inputs until a base case.";
  }

  if (question.includes("another chat")) {
    return "I only received the current question in this request.";
  }

  return "Recursion is when a process solves a problem by calling a smaller version of itself until it reaches a stopping condition.";
}

async function sendMockStream(response, requestBody, question) {
  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream; charset=utf-8",
  });

  if (question.includes("malformed provider stream")) {
    response.end("data: not-json\n\n");
    return;
  }

  const answer = getMockAnswer(question);
  const chunks = question.includes("oversized provider output")
    ? [answer]
    : [
        "Recursion is when ",
        "a process solves a problem by calling a smaller version of itself ",
        "until it reaches a stopping condition.",
      ];
  const delay = question.includes("slow streaming response") ? 350 : 75;
  let sequence = 1;

  if (!question.includes("empty provider response")) {
    if (question.includes("slow streaming response")) {
      await wait(delay);
    }

    for (const chunk of chunks) {
      if (response.destroyed) {
        return;
      }

      writeOpenAiStreamEvent(response, {
        type: "response.output_text.delta",
        content_index: 0,
        delta: chunk,
        item_id: "msg_stream_test",
        logprobs: [],
        output_index: 0,
        sequence_number: sequence,
      });
      sequence += 1;

      if (question.includes("interrupted provider stream")) {
        await wait(100);
        response.destroy();
        return;
      }

      await wait(delay);
    }
  }

  if (response.destroyed) {
    return;
  }

  writeOpenAiStreamEvent(response, {
    type: "response.completed",
    response: createMockResponse(
      question.includes("empty provider response") ? "" : answer,
      requestBody,
    ),
    sequence_number: sequence,
  });
  response.end("data: [DONE]\n\n");
}

function getLastUserText(requestBody) {
  if (!Array.isArray(requestBody.input)) {
    return "";
  }

  const lastMessage = requestBody.input.at(-1);
  return typeof lastMessage?.content === "string" ? lastMessage.content : "";
}

function createMockProvider(requests) {
  return createServer(async (request, response) => {
    if (request.method !== "POST" || request.url !== "/v1/responses") {
      response.writeHead(404).end();
      return;
    }

    try {
      const body = await readJsonBody(request);
      const question = getLastUserText(body);

      const requestRecord = {
        authorizationPresent: request.headers.authorization === `Bearer ${testApiKey}`,
        body,
        cancelled: false,
        question,
      };
      requests.push(requestRecord);
      response.on("close", () => {
        if (!response.writableEnded) {
          requestRecord.cancelled = true;
        }
      });

      if (question.includes("provider failure")) {
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            error: {
              code: "mock_provider_failure",
              message: "Mock provider failure",
              type: "server_error",
            },
          }),
        );
        return;
      }

      if (question.includes("provider timeout")) {
        return;
      }

      if (body.stream === true) {
        await sendMockStream(response, body, question);
        return;
      }

      const answer = question.includes("empty provider response")
        ? ""
        : getMockAnswer(question);

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(createMockResponse(answer, body)));
    } catch {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: { message: "Invalid mock request" } }));
    }
  });
}

async function waitForServer(baseUrl, child, attempts = 120) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before startup with code ${child.exitCode}.`);
    }

    try {
      const response = await fetch(baseUrl);

      if (response.ok) {
        return;
      }

      lastError = new Error(`Portfolio returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    await wait(250);
  }

  throw lastError ?? new Error("Timed out waiting for the portfolio server.");
}

async function waitForJson(url, attempts = 120) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return response.json();
      }

      lastError = new Error(`${url} returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    await wait(250);
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}.`);
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let sequence = 0;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (!message.id || !pending.has(message.id)) {
      return;
    }

    const {
      clear: clearCommandTimeout,
      resolve: resolveCommand,
      reject: rejectCommand,
    } = pending.get(message.id);
    pending.delete(message.id);
    clearCommandTimeout();

    if (message.error) {
      rejectCommand(new Error(message.error.message));
      return;
    }

    resolveCommand(message.result);
  });

  socket.addEventListener("close", (event) => {
    for (const command of pending.values()) {
      command.clear();
      command.reject(
        new Error(
          `Browser debugging connection closed (${event.code}${event.reason ? `: ${event.reason}` : ""}).`,
        ),
      );
    }

    pending.clear();
  });

  return new Promise((resolveClient, rejectClient) => {
    socket.addEventListener("open", () => {
      resolveClient({
        send(method, params = {}) {
          sequence += 1;
          const id = sequence;

          return new Promise((resolveCommand, rejectCommand) => {
            const timeout = setTimeout(() => {
              pending.delete(id);
              rejectCommand(new Error(`Browser command timed out: ${method}.`));
            }, 10_000);

            pending.set(id, {
              clear: () => clearTimeout(timeout),
              reject: rejectCommand,
              resolve: resolveCommand,
            });

            try {
              socket.send(JSON.stringify({ id, method, params }));
            } catch (error) {
              clearTimeout(timeout);
              pending.delete(id);
              rejectCommand(error);
            }
          });
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener("error", rejectClient);
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Browser evaluation failed.",
    );
  }

  return result.result.value;
}

async function pressEnter(client) {
  await client.send("Input.dispatchKeyEvent", {
    code: "Enter",
    key: "Enter",
    type: "rawKeyDown",
    windowsVirtualKeyCode: 13,
  });
  await client.send("Input.dispatchKeyEvent", {
    code: "Enter",
    key: "Enter",
    type: "keyUp",
    windowsVirtualKeyCode: 13,
  });
}

async function pressSpace(client) {
  await client.send("Input.dispatchKeyEvent", {
    code: "Space",
    key: " ",
    type: "rawKeyDown",
    windowsVirtualKeyCode: 32,
  });
  await client.send("Input.dispatchKeyEvent", {
    code: "Space",
    key: " ",
    type: "keyUp",
    windowsVirtualKeyCode: 32,
  });
}

async function submitBrowserQuestion(client, question) {
  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      const value = ${JSON.stringify(question)};
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
      textarea.focus();
    })()`,
  );
  await pressEnter(client);
}

async function runBrowserStreamChecks(baseUrl) {
  const remotePort = await getAvailablePort();
  const userDataDir = await mkdtemp(join(tmpdir(), "carino-stream-edge-"));
  let edgeOutput = "";
  const edge = spawn(
    edgePath,
    [
      "--headless=new",
      `--remote-debugging-port=${remotePort}`,
      "--remote-allow-origins=*",
      `--user-data-dir=${userDataDir}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  edge.stdout.on("data", (chunk) => {
    edgeOutput += chunk.toString();
  });
  edge.stderr.on("data", (chunk) => {
    edgeOutput += chunk.toString();
  });

  try {
    await waitForJson(`http://127.0.0.1:${remotePort}/json/version`);
    const targets = await waitForJson(`http://127.0.0.1:${remotePort}/json/list`);
    const page = targets.find(
      (target) => target.type === "page" && target.webSocketDebuggerUrl,
    );
    assert(page, "Could not find a browser QA page target.");
    const client = await createCdpClient(page.webSocketDebuggerUrl);

    try {
      await client.send("Page.enable");
      await client.send("Runtime.enable");
      await client.send("Page.navigate", { url: baseUrl });
      await wait(1_000);
      await client.send("Page.bringToFront");
      await evaluate(
        client,
        `document.querySelector('button[aria-label="Open Nikki AI"]').focus()`,
      );
      await pressSpace(client);
      await wait(200);

      await submitBrowserQuestion(
        client,
        "Return a slow streaming response for cancellation.",
      );
      await wait(100);
      const waitingState = await evaluate(
        client,
        `(() => ({
          hasThinking: document.body.innerText.includes('Thinking...'),
          hasStop: Boolean(document.querySelector('button[aria-label="Stop generating"]')),
          liveStatus: document.querySelector('p[aria-live="polite"][role="status"]')?.textContent,
        }))()`,
      );
      assert(waitingState.hasThinking, "Browser did not show Thinking before first content.");
      assert(waitingState.hasStop, "Browser did not expose Stop generating.");

      await wait(400);
      const partialState = await evaluate(
        client,
        `(() => ({
          hasPartial: document.body.innerText.includes('Recursion is when'),
          hasFullAnswer: document.body.innerText.includes('stopping condition.'),
          hasStop: Boolean(document.querySelector('button[aria-label="Stop generating"]')),
          hasThinking: document.body.innerText.includes('Thinking...'),
        }))()`,
      );
      assert(partialState.hasPartial, "Browser did not render the first text delta.");
      assert(!partialState.hasFullAnswer, "Browser rendered the full answer before streaming completed.");
      assert(partialState.hasStop, "Stop control disappeared while streaming.");
      assert(!partialState.hasThinking, "Thinking remained visible after the first text delta.");

      await evaluate(
        client,
        `document.querySelector('button[aria-label="Stop generating"]').focus()`,
      );
      await pressSpace(client);
      await wait(350);
      const stoppedState = await evaluate(
        client,
        `(() => ({
          hasPartial: document.body.innerText.includes('Recursion is when'),
          hasFullAnswer: document.body.innerText.includes('stopping condition.'),
          hasRetry: Boolean(document.querySelector('button[aria-label="Retry last portfolio AI question"]')),
          hasSend: Boolean(document.querySelector('button[aria-label="Send message to Nikki AI"]')),
          hasStopNotice: document.body.innerText.includes('Generation stopped. The partial answer was kept.'),
          liveStatus: document.querySelector('p[aria-live="polite"][role="status"]')?.textContent,
        }))()`,
      );
      assert(stoppedState.hasPartial, "Stopped response did not preserve partial text.");
      assert(!stoppedState.hasFullAnswer, "Stopped response continued to the full answer.");
      assert(stoppedState.hasRetry, "Stopped response did not expose Retry.");
      assert(stoppedState.hasSend, "Composer did not return to the send state after stopping.");
      assert(stoppedState.hasStopNotice, "Stopped response notice was missing.");
      assert(
        stoppedState.liveStatus?.includes("Generation stopped"),
        "Screen-reader status did not report cancellation.",
      );

      await evaluate(
        client,
        `document.querySelector('button[aria-label="Retry last portfolio AI question"]').focus()`,
      );
      await pressSpace(client);
      await wait(1_900);
      const retryState = await evaluate(
        client,
        `(() => ({
          hasFullAnswer: document.body.innerText.includes('stopping condition.'),
          hasRetry: Boolean(document.querySelector('button[aria-label="Retry last portfolio AI question"]')),
          hasSend: Boolean(document.querySelector('button[aria-label="Send message to Nikki AI"]')),
          hasStop: Boolean(document.querySelector('button[aria-label="Stop generating"]')),
          liveStatus: document.querySelector('p[aria-live="polite"][role="status"]')?.textContent,
          messageLiveRegions: [...document.querySelectorAll('[aria-live]')]
            .filter((node) => !node.matches('p[aria-live="polite"][role="status"]')).length,
        }))()`,
      );
      assert(retryState.hasFullAnswer, "Retry did not complete the streamed answer.");
      assert(!retryState.hasRetry, "Retry notice remained after a successful answer.");
      assert(retryState.hasSend && !retryState.hasStop, "Composer did not finish retry cleanly.");
      assert(
        retryState.liveStatus?.includes("Answer received"),
        "Screen-reader status did not report completion.",
      );
      assert(
        retryState.messageLiveRegions === 0,
        "Streaming message content is inside an extra live region.",
      );

      await evaluate(
        client,
        `(() => {
          window.__portfolioAiOriginalFetch = window.fetch;
          window.fetch = () => Promise.resolve(new Response('not-json\\n', {
            status: 200,
            headers: { 'Content-Type': 'application/x-ndjson' },
          }));
        })()`,
      );
      await submitBrowserQuestion(client, "Trigger a malformed browser stream.");
      await wait(350);
      const malformedState = await evaluate(
        client,
        `(() => {
          window.fetch = window.__portfolioAiOriginalFetch;
          return {
            hasFallback: document.body.innerText.includes('I can still help with questions about my experience'),
            hasRetry: Boolean(document.querySelector('button[aria-label="Retry last portfolio AI question"]')),
            hasSend: Boolean(document.querySelector('button[aria-label="Send message to Nikki AI"]')),
          };
        })()`,
      );
      assert(malformedState.hasFallback, "Malformed browser stream did not show a safe fallback.");
      assert(malformedState.hasRetry, "Malformed browser stream did not expose Retry.");
      assert(malformedState.hasSend, "Malformed browser stream left the composer blocked.");

      await evaluate(
        client,
        `document.querySelector('button[aria-label="Reset portfolio AI conversation"]').focus()`,
      );
      await pressSpace(client);
      await wait(200);
      const resetState = await evaluate(
        client,
        `(() => ({
          greetingVisible: document.body.innerText.includes("Hi, I'm Nikki AI."),
          messageCount: document.querySelectorAll('[data-message-role]').length,
          suggestionCount: document.querySelectorAll('[aria-label="Suggested questions"] button').length,
        }))()`,
      );
      assert(resetState.greetingVisible, "Keyboard reset did not restore the greeting.");
      assert(resetState.messageCount === 1, "Keyboard reset did not clear conversation messages.");
      assert(resetState.suggestionCount === 3, "Keyboard reset did not restore starter prompts.");

      await evaluate(
        client,
        `document.querySelector('button[aria-label="Close Nikki AI"]').focus()`,
      );
      await pressSpace(client);
      await wait(200);
      const closeState = await evaluate(
        client,
        `(() => ({
          launcherVisible: Boolean(document.querySelector('button[aria-label="Open Nikki AI"]')),
          launcherFocused: document.activeElement?.getAttribute('aria-label') === 'Open Nikki AI',
          panelVisible: Boolean(document.querySelector('#portfolio-ai-question')),
        }))()`,
      );
      assert(
        closeState.launcherVisible && !closeState.panelVisible,
        "Keyboard close did not hide the panel.",
      );
      assert(closeState.launcherFocused, "Keyboard close did not return focus to the launcher.");

      return {
        keyboardWorkflow: true,
        malformedFallback: true,
        partialAnswerPreserved: true,
        retryCompleted: true,
        screenReaderMilestones: true,
        stopControl: true,
        thinkingLifecycle: true,
      };
    } finally {
      client.close();
    }
  } catch (error) {
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\n${edgeOutput.slice(-2_000)}`,
    );
  } finally {
    await stopChild(edge);
    await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function postQuestion(baseUrl, question, history = []) {
  qaClientSequence += 1;
  const response = await fetch(`${baseUrl}/api/portfolio-ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": `provider-qa-${qaClientSequence}`,
    },
    body: JSON.stringify({ history, question }),
  });

  return {
    headers: response.headers,
    payload: await response.json(),
    status: response.status,
  };
}

async function postStreamQuestion(baseUrl, question, history = []) {
  qaClientSequence += 1;
  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}/api/portfolio-ai`, {
    method: "POST",
    headers: {
      Accept: "application/x-ndjson",
      "Content-Type": "application/json",
      "X-Forwarded-For": `provider-qa-${qaClientSequence}`,
    },
    body: JSON.stringify({ history, question }),
  });
  const contentType = response.headers.get("content-type") ?? "";

  assert(
    contentType.includes("application/x-ndjson"),
    `Expected an NDJSON response, received ${contentType || "no content type"}.`,
  );
  assert(response.body, "Streaming response body was missing.");

  const events = [];
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim()) {
        events.push({
          ...JSON.parse(line),
          receivedAt: Date.now(),
        });
      }
    }

    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    events.push({
      ...JSON.parse(buffer),
      receivedAt: Date.now(),
    });
  }

  return {
    durationMs: Date.now() - startedAt,
    events,
    headers: response.headers,
    status: response.status,
  };
}

async function abortAfterFirstDelta(baseUrl, question) {
  qaClientSequence += 1;
  const controller = new AbortController();
  const response = await fetch(`${baseUrl}/api/portfolio-ai`, {
    method: "POST",
    headers: {
      Accept: "application/x-ndjson",
      "Content-Type": "application/json",
      "X-Forwarded-For": `provider-qa-${qaClientSequence}`,
    },
    body: JSON.stringify({ question }),
    signal: controller.signal,
  });

  assert(response.body, "Cancellable stream body was missing.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let partialText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        const event = JSON.parse(line);

        if (event.type === "text_delta") {
          partialText += event.delta;
          controller.abort();
          await reader.read().catch(() => undefined);
          return partialText;
        }
      }
    }
  } finally {
    controller.abort();
    reader.releaseLock();
  }

  return partialText;
}

async function stopChild(child) {
  if (child.exitCode !== null) {
    return;
  }

  child.kill();
  await Promise.race([once(child, "exit"), wait(5_000)]);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
  }
}

async function run() {
  const providerRequests = [];
  const provider = createMockProvider(providerRequests);
  const providerPort = await listenOnAvailablePort(provider);
  const portfolioPort = await getAvailablePort();
  const baseUrl = `http://127.0.0.1:${portfolioPort}`;
  let serverOutput = "";

  const nextServer = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(portfolioPort)],
    {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        OPENAI_API_KEY: testApiKey,
        OPENAI_MODEL: testModel,
        PORTFOLIO_AI_ENABLE_GENERIC: "true",
        PORTFOLIO_AI_TEST_BASE_URL: `http://127.0.0.1:${providerPort}/v1`,
        PORTFOLIO_AI_TEST_MODE: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  nextServer.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  nextServer.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(baseUrl, nextServer);

    const history = Array.from({ length: 10 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `History message ${index + 1}`,
    }));
    const generic = await postQuestion(
      baseUrl,
      "Explain recursion in one sentence.",
      history,
    );

    assert(generic.status === 200, "Generic question did not return HTTP 200.");
    assert(generic.payload.mode === "ai", "Generic question did not use AI mode.");
    assert(generic.payload.message?.type === "text", "Generic answer was not text.");
    assert(
      generic.payload.answer.includes("Recursion is when"),
      "Generic answer did not contain the mocked provider text.",
    );
    assert(providerRequests.length === 1, "Expected one provider request.");
    assert(
      /^[0-9a-f-]{36}$/i.test(generic.headers.get("x-request-id") ?? ""),
      "Generic response did not include a request ID.",
    );

    const firstRequest = providerRequests[0];
    assert(firstRequest.authorizationPresent, "Provider authorization was missing.");
    assert(firstRequest.body.model === testModel, "Provider model was incorrect.");
    assert(firstRequest.body.store === false, "Provider response storage was not disabled.");
    assert(
      firstRequest.body.max_output_tokens === 700,
      "Provider output-token limit was incorrect.",
    );
    assert(
      !Array.isArray(firstRequest.body.tools) || firstRequest.body.tools.length === 0,
      "Provider request unexpectedly enabled tools or live web search.",
    );
    assert(
      firstRequest.body.instructions.includes("neutral AI assistant"),
      "General-assistant voice instructions were missing.",
    );
    assert(
      firstRequest.body.instructions.includes("Approved portfolio context:"),
      "Approved portfolio context was missing.",
    );
    assert(
      firstRequest.body.input.length === 9,
      "Conversation history was not capped at eight messages plus the question.",
    );
    assert(
      firstRequest.body.input[0].content === "History message 3",
      "Conversation history did not retain the latest eight messages.",
    );

    const writing = await postQuestion(
      baseUrl,
      "Rewrite this: the meeting starts at noon.",
    );
    assert(
      writing.payload.mode === "ai" &&
        writing.payload.answer === "The meeting will begin at noon.",
      "Generic writing request did not return the mocked writing answer.",
    );

    const coding = await postQuestion(
      baseUrl,
      "Write a JavaScript function that adds two numbers.",
    );
    assert(
      coding.payload.mode === "ai" && coding.payload.answer.includes("function add"),
      "Generic coding request did not return the mocked code answer.",
    );

    const calculation = await postQuestion(baseUrl, "What is 19 + 23?");
    assert(
      calculation.payload.mode === "ai" &&
        calculation.payload.answer.includes("42"),
      "Generic calculation request did not return the mocked result.",
    );

    const followUpHistory = [
      { role: "user", content: "Explain recursion." },
      {
        role: "assistant",
        content: "Recursion solves a problem through smaller versions of itself.",
      },
    ];
    const followUp = await postQuestion(
      baseUrl,
      "Make that explanation shorter.",
      followUpHistory,
    );
    const followUpRequest = providerRequests.at(-1);
    assert(
      followUp.payload.mode === "ai" && followUp.payload.answer.includes("base case"),
      "Multi-turn follow-up did not return the mocked contextual answer.",
    );
    assert(
      followUpRequest.body.input.length === 3 &&
        followUpRequest.body.input[0].content === "Explain recursion." &&
        followUpRequest.body.input[1].role === "assistant",
      "Multi-turn follow-up did not send the supplied conversation context.",
    );

    const isolated = await postQuestion(
      baseUrl,
      "What did I ask before in another chat?",
    );
    const isolatedRequest = providerRequests.at(-1);
    assert(
      isolated.payload.mode === "ai" && isolatedRequest.body.input.length === 1,
      "A fresh request inherited conversation history from another request.",
    );

    const providerCountBeforeResume = providerRequests.length;
    const resume = await postQuestion(baseUrl, "Can I download your resume?");
    assert(resume.status === 200, "Resume question did not return HTTP 200.");
    assert(
      resume.payload.mode === "local_portfolio_answer",
      "Resume question did not remain local.",
    );
    assert(resume.payload.message?.type === "file", "Resume response was not a file.");
    assert(
      providerRequests.length === providerCountBeforeResume,
      "Resume question unexpectedly called the provider.",
    );

    const empty = await postQuestion(
      baseUrl,
      "Return an empty provider response now.",
    );
    assert(empty.status === 200, "Empty provider response did not return HTTP 200.");
    assert(
      empty.payload.mode === "safe_fallback",
      "Empty provider response did not use the safe fallback.",
    );

    const privateVisitorMarker = "visitor-provider-failure-marker";
    const failure = await postQuestion(
      baseUrl,
      `Trigger a provider failure now. ${privateVisitorMarker}`,
    );
    assert(failure.status === 200, "Provider failure did not return HTTP 200.");
    assert(
      failure.payload.mode === "safe_fallback",
      "Provider failure did not use the safe fallback.",
    );
    assert(
      !JSON.stringify(failure.payload).includes(testApiKey),
      "Provider failure exposed the API key to the client.",
    );
    assert(
      !serverOutput.includes(testApiKey),
      "Sanitized server logs exposed the API key.",
    );
    assert(
      !serverOutput.includes(privateVisitorMarker),
      "Sanitized server logs exposed visitor prompt content.",
    );
    assert(
      serverOutput.includes("requestId"),
      "Provider failure log did not include a request ID.",
    );

    const oversized = await postQuestion(
      baseUrl,
      "Return oversized provider output now.",
    );
    assert(
      oversized.payload.answer.length === 8_000,
      "Non-streaming provider output was not capped at the character limit.",
    );

    const oversizedStream = await postStreamQuestion(
      baseUrl,
      "Return oversized provider output as a stream.",
    );
    const oversizedStreamText = oversizedStream.events
      .filter((event) => event.type === "text_delta")
      .map((event) => event.delta)
      .join("");
    assert(
      oversizedStreamText.length === 8_000,
      "Streaming provider output was not capped at the character limit.",
    );
    assert(
      oversizedStream.events.at(-1)?.type === "done" &&
        oversizedStream.events.at(-1)?.mode === "ai",
      "Capped provider stream did not complete cleanly.",
    );

    const stream = await postStreamQuestion(
      baseUrl,
      "Explain recursion with a streamed answer.",
      history,
    );
    const textDeltas = stream.events.filter((event) => event.type === "text_delta");
    const streamMetadata = stream.events.find((event) => event.type === "metadata");
    const streamDone = stream.events.find((event) => event.type === "done");

    assert(stream.status === 200, "Generic stream did not return HTTP 200.");
    assert(streamMetadata?.mode === "ai", "Generic stream metadata mode was incorrect.");
    assert(textDeltas.length === 3, "Generic stream did not preserve provider deltas.");
    assert(
      textDeltas.map((event) => event.delta).join("").includes("Recursion is when"),
      "Generic stream text was incomplete.",
    );
    assert(streamDone?.mode === "ai", "Generic stream did not complete in AI mode.");
    assert(
      textDeltas[0].receivedAt < streamDone.receivedAt,
      "First text content did not arrive before stream completion.",
    );

    const providerCountBeforeStreamResume = providerRequests.length;
    const streamResume = await postStreamQuestion(
      baseUrl,
      "Can I download your resume?",
    );
    assert(
      streamResume.events.some(
        (event) => event.type === "message" && event.message?.type === "file",
      ),
      "Streamed resume response did not contain a structured file message.",
    );
    assert(
      providerRequests.length === providerCountBeforeStreamResume,
      "Streamed resume request unexpectedly called the provider.",
    );

    const emptyStream = await postStreamQuestion(
      baseUrl,
      "Return an empty provider response now.",
    );
    assert(
      emptyStream.events.some((event) => event.type === "error" && event.retryable),
      "Empty provider stream did not return a retryable error.",
    );
    assert(
      emptyStream.events.at(-1)?.type === "done" &&
        emptyStream.events.at(-1)?.mode === "safe_fallback",
      "Empty provider stream did not finish safely.",
    );

    const malformedStream = await postStreamQuestion(
      baseUrl,
      "Return a malformed provider stream now.",
    );
    assert(
      malformedStream.events.some((event) => event.type === "error"),
      "Malformed provider stream did not become a safe error event.",
    );

    const interruptedStream = await postStreamQuestion(
      baseUrl,
      "Return an interrupted provider stream now.",
    );
    assert(
      interruptedStream.events.some((event) => event.type === "text_delta"),
      "Interrupted provider stream did not preserve partial text.",
    );
    assert(
      interruptedStream.events.some((event) => event.type === "error"),
      "Interrupted provider stream did not return a retryable error.",
    );

    const timeoutStartedAt = Date.now();
    const timeoutStream = await postStreamQuestion(
      baseUrl,
      "Trigger a provider timeout now.",
    );
    assert(
      timeoutStream.events.some((event) => event.type === "error"),
      "Provider timeout did not return a safe error event.",
    );
    assert(
      Date.now() - timeoutStartedAt >= 7_000,
      "Provider timeout completed before the configured timeout window.",
    );

    const partialText = await abortAfterFirstDelta(
      baseUrl,
      "Return a slow streaming response for cancellation.",
    );
    assert(partialText.length > 0, "Cancellation test did not receive partial text.");
    await wait(300);
    const cancelledRequest = providerRequests.find((request) =>
      request.question.includes("slow streaming response"),
    );
    assert(cancelledRequest?.cancelled, "Browser cancellation did not abort the provider stream.");

    const browserAssertions = await runBrowserStreamChecks(baseUrl);
    assert(
      !serverOutput.includes(testApiKey),
      "Streaming server logs exposed the API key.",
    );

    console.log(
      JSON.stringify(
        {
          assertions: {
            boundedHistory: true,
            boundedOutput: true,
            boundedOutputCharacters: true,
            cancellation: true,
            genericAnswer: true,
            genericCalculation: true,
            genericCoding: true,
            genericWriting: true,
            incrementalStreaming: true,
            interruptedStreamFallback: true,
            localIntentBypass: true,
            malformedStreamFallback: true,
            safeFailureFallback: true,
            sessionIsolation: true,
            serverSideSecret: true,
            storeDisabled: true,
            toolsDisabled: true,
            timeoutFallback: true,
            multiTurnContext: true,
          },
          browserAssertions,
          providerRequests: providerRequests.length,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const diagnosticOutput = serverOutput.slice(-2_000);
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\n${diagnosticOutput}`,
    );
  } finally {
    await stopChild(nextServer);
    provider.closeAllConnections?.();
    await Promise.race([
      new Promise((resolveClose) => provider.close(resolveClose)),
      wait(5_000),
    ]);
    provider.closeAllConnections?.();
  }
}

await run();
