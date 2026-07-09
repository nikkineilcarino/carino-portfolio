import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const remotePort = 9224;
const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3014";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(url, attempts = 80) {
  let lastError;

  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return response.json();
      }

      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await wait(250);
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

async function waitForHttpOk(url, attempts = 80) {
  let lastError;

  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }

      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await wait(250);
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`);
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

    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);

    if (message.error) {
      reject(new Error(message.error.message));
      return;
    }

    resolve(message.result);
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          sequence += 1;
          const id = sequence;
          socket.send(JSON.stringify({ id, method, params }));

          return new Promise((commandResolve, commandReject) => {
            pending.set(id, {
              resolve: commandResolve,
              reject: commandReject,
            });
          });
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener("error", reject);
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }

  return result.result.value;
}

async function testViewport(client, viewport) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 768,
  });
  await client.send("Page.navigate", { url: baseUrl });
  await wait(1000);

  const closedState = await evaluate(
    client,
    `(() => {
      const button = [...document.querySelectorAll('button')].find((node) => node.textContent.includes('Ask AI'));
      return {
        hasButton: Boolean(button),
        buttonHeight: button ? Math.round(button.getBoundingClientRect().height) : 0,
        ariaExpanded: button ? button.getAttribute('aria-expanded') : null,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    })()`,
  );

  await evaluate(
    client,
    `(() => {
      [...document.querySelectorAll('button')].find((node) => node.textContent.includes('Ask AI')).click();
    })()`,
  );
  await wait(500);

  const openState = await evaluate(
    client,
    `(() => {
      const aside = document.querySelector('aside[aria-label="Portfolio AI assistant"]');
      const textarea = document.querySelector('#portfolio-ai-question');
      const sendButton = document.querySelector('button[aria-label="Send portfolio question"]');
      const panel = aside ? aside.querySelector('[id]') : null;
      const panelBox = panel ? panel.getBoundingClientRect() : null;
      return {
        hasPanel: Boolean(panel),
        hasTextarea: Boolean(textarea),
        hasSendButton: Boolean(sendButton),
        panelWidth: panelBox ? Math.round(panelBox.width) : 0,
        panelLeft: panelBox ? Math.round(panelBox.left) : null,
        panelRight: panelBox ? Math.round(panelBox.right) : null,
        panelBottom: panelBox ? Math.round(panelBox.bottom) : null,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        greetingVisible: document.body.innerText.includes("Hi, I can answer questions about Nikki"),
      };
    })()`,
  );

  await evaluate(
    client,
    `(() => {
      const sendButton = document.querySelector('button[aria-label="Send portfolio question"]');
      sendButton.click();
    })()`,
  );
  await wait(250);
  const emptyInputState = await evaluate(
    client,
    `document.body.innerText.includes("Type a question first.")`,
  );

  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      textarea.focus();
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(textarea, "What skills does Nikki have?");
      textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "What skills does Nikki have?" }));
      document.querySelector('button[aria-label="Send portfolio question"]').click();
    })()`,
  );
  await wait(100);
  const loadingState = await evaluate(
    client,
    `document.body.innerText.includes("Thinking...")`,
  );
  await wait(900);
  const answeredState = await evaluate(
    client,
    `(() => {
      const text = document.body.innerText;
      return text.includes("Nikki's approved portfolio lists these skill areas") && text.includes("Manual Testing");
    })()`,
  );

  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      textarea.focus();
      const value = "Summarize this portfolio assistant UI behavior in a very long way. ".repeat(20);
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
      document.querySelector('button[aria-label="Send portfolio question"]').click();
    })()`,
  );
  await wait(900);
  const longInputState = await evaluate(
    client,
    `(() => {
      const panel = document.querySelector('aside[aria-label="Portfolio AI assistant"] [id]');
      const panelBox = panel.getBoundingClientRect();
      return {
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        panelWidth: Math.round(panelBox.width),
        panelRight: Math.round(panelBox.right),
        panelLeft: Math.round(panelBox.left),
      };
    })()`,
  );

  await evaluate(
    client,
    `(() => {
      window.__portfolioAiOriginalFetch = window.fetch;
      window.fetch = () => Promise.reject(new Error("Forced QA fetch failure"));
      const textarea = document.querySelector('#portfolio-ai-question');
      textarea.focus();
      const value = "Trigger an error state";
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
      document.querySelector('button[aria-label="Send portfolio question"]').click();
    })()`,
  );
  await wait(600);
  const errorState = await evaluate(
    client,
    `(() => {
      window.fetch = window.__portfolioAiOriginalFetch;
      return document.body.innerText.includes("I could not answer that right now. Please try again in a moment.");
    })()`,
  );

  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
  });
  await wait(100);
  const focusState = await evaluate(
    client,
    `(() => {
      const active = document.activeElement;
      const styles = getComputedStyle(active);
      return {
        tag: active.tagName,
        id: active.id,
        ariaLabel: active.getAttribute('aria-label'),
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor,
      };
    })()`,
  );

  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await wait(250);
  const escapeState = await evaluate(
    client,
    `(() => ({
      panelStillOpen: Boolean(document.querySelector('#portfolio-ai-question')),
      hasCloseButton: [...document.querySelectorAll('button')].some((node) => node.textContent.includes('Close')),
    }))()`,
  );

  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await client.send("Page.reload");
  await wait(1000);
  const reducedMotionState = await evaluate(
    client,
    `(() => {
      return {
        reducedMotionMedia: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      };
    })()`,
  );

  return {
    viewport: viewport.name,
    viewportWidth: viewport.width,
    closedState,
    openState,
    emptyInputState,
    loadingState,
    answeredState,
    longInputState,
    errorState,
    focusState,
    escapeState,
    reducedMotionState,
  };
}

function assertResult(result) {
  const failures = [];
  const width = result.viewport;

  if (!result.closedState.hasButton) failures.push(`${width}: missing Ask AI button`);
  if (result.closedState.buttonHeight < 44) failures.push(`${width}: Ask AI button is below 44px`);
  if (result.closedState.horizontalOverflow) failures.push(`${width}: closed state has horizontal overflow`);
  if (!result.openState.hasPanel) failures.push(`${width}: panel did not open`);
  if (!result.openState.hasTextarea) failures.push(`${width}: textarea missing`);
  if (!result.openState.hasSendButton) failures.push(`${width}: send button missing`);
  if (!result.openState.greetingVisible) failures.push(`${width}: greeting missing`);
  if (result.openState.horizontalOverflow) failures.push(`${width}: open state has horizontal overflow`);
  if (result.openState.panelLeft < 0) failures.push(`${width}: panel overflows left`);
  if (result.openState.panelRight > result.viewportWidth) failures.push(`${width}: panel overflows right`);
  if (!result.emptyInputState) failures.push(`${width}: empty-input error missing`);
  if (!result.loadingState) failures.push(`${width}: Thinking state missing`);
  if (!result.answeredState) failures.push(`${width}: answer state missing expected content`);
  if (result.longInputState.horizontalOverflow) failures.push(`${width}: long input caused horizontal overflow`);
  if (!result.errorState) failures.push(`${width}: forced error state missing`);
  if (
    result.focusState.outlineStyle === "none" &&
    result.focusState.boxShadow === "none" &&
    result.focusState.borderColor !== "rgb(37, 99, 235)"
  ) {
    failures.push(`${width}: focused control has no visible focus style`);
  }
  if (result.escapeState.panelStillOpen) failures.push(`${width}: Escape did not close panel`);
  if (!result.reducedMotionState.reducedMotionMedia) failures.push(`${width}: reduced-motion media not active`);

  return failures;
}

const userDataDir = await mkdtemp(join(tmpdir(), "carino-edge-qa-"));
const edge = spawn(edgePath, [
  "--headless=new",
  `--remote-debugging-port=${remotePort}`,
  `--user-data-dir=${userDataDir}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
]);

try {
  await waitForHttpOk(baseUrl);
  await waitForJson(`http://localhost:${remotePort}/json/version`);
  const pageTargetResponse = await fetch(
    `http://localhost:${remotePort}/json/new?about:blank`,
    { method: "PUT" },
  );

  if (!pageTargetResponse.ok) {
    throw new Error(`Could not create Edge page target: ${pageTargetResponse.status}`);
  }

  const pageTarget = await pageTargetResponse.json();
  const client = await createCdpClient(pageTarget.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("DOM.enable");

  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1366, height: 900 },
  ];
  const results = [];
  const failures = [];

  for (const viewport of viewports) {
    const result = await testViewport(client, viewport);
    results.push(result);
    failures.push(...assertResult(result));
  }

  client.close();

  console.log(JSON.stringify({ results, failures }, null, 2));

  if (failures.length > 0) {
    throw new Error(`${failures.length} Phase 5 browser QA assertion(s) failed.`);
  }
} finally {
  edge.kill();
  if (edge.exitCode === null) {
    try {
      await once(edge, "exit");
    } catch {
      // Ignore process shutdown races during QA cleanup.
    }
  }
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
