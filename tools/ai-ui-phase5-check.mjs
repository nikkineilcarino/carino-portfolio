import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const remotePort = 9224;
const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3014";
const screenshotDir = process.env.QA_SCREENSHOT_DIR;
const richMarkdownAnswer = [
  "## Safe formatting",
  "",
  "- First item",
  "- Second item with `inline code`",
  "",
  "> A short quoted note.",
  "",
  "```js",
  'const value = "safe";',
  "console.log(value);",
  "```",
  "",
  "[Official documentation](https://example.com/docs)",
  "",
  "[Email Nikki](mailto:nikkineil.carino@gmail.com)",
  "",
  "[Unsafe action](javascript:window.__portfolioMarkdownXss=true)",
  "",
  '<div id="raw-html-escape">Raw HTML must not render.</div>',
  "<script>window.__portfolioMarkdownXss = true</script>",
  "",
  `Long content: ${"A".repeat(220)}`,
].join("\n");

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
    userGesture: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }

  return result.result.value;
}

async function testViewport(client, viewport) {
  await client.send("Network.setExtraHTTPHeaders", {
    headers: {
      "X-Forwarded-For": `qa-${viewport.name}`,
    },
  });
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
      const button = document.querySelector('button[aria-label="Open Nikki AI"]');
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
      document.querySelector('button[aria-label="Open Nikki AI"]').click();
    })()`,
  );
  await wait(500);

  const openState = await evaluate(
    client,
    `(() => {
      const aside = document.querySelector('aside[aria-label="Nikki AI assistant"]');
      const textarea = document.querySelector('#portfolio-ai-question');
      const sendButton = document.querySelector('button[aria-label="Send message to Nikki AI"]');
      const panel = aside ? aside.querySelector('[id]') : null;
      const panelBox = panel ? panel.getBoundingClientRect() : null;
      const assistantMessage = document.querySelector('[data-message-role="assistant"] > div:last-child');
      const assistantStyles = assistantMessage ? getComputedStyle(assistantMessage) : null;
      return {
        hasPanel: Boolean(panel),
        hasTextarea: Boolean(textarea),
        hasSendButton: Boolean(sendButton),
        panelWidth: panelBox ? Math.round(panelBox.width) : 0,
        panelHeight: panelBox ? Math.round(panelBox.height) : 0,
        panelLeft: panelBox ? Math.round(panelBox.left) : null,
        panelRight: panelBox ? Math.round(panelBox.right) : null,
        panelTop: panelBox ? Math.round(panelBox.top) : null,
        panelBottom: panelBox ? Math.round(panelBox.bottom) : null,
        panelBackground: panel ? getComputedStyle(panel).backgroundColor : null,
        assistantTextBorderWidth: assistantStyles ? assistantStyles.borderTopWidth : null,
        suggestionCount: document.querySelectorAll('[aria-label="Suggested questions"] button').length,
        launcherVisible: Boolean(document.querySelector('button[aria-label="Open Nikki AI"]')),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        greetingVisible: document.body.innerText.includes("Hi, I'm Nikki AI."),
        activeElementId: document.activeElement?.id ?? null,
      };
    })()`,
  );

  await evaluate(
    client,
    `document.querySelector('#portfolio-ai-question').focus()`,
  );
  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
  });
  await client.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
  });
  await wait(100);
  const focusOrderState = await evaluate(
    client,
    `(() => ({
      ariaLabel: document.activeElement?.getAttribute('aria-label') ?? null,
      tag: document.activeElement?.tagName ?? null,
    }))()`,
  );
  await evaluate(
    client,
    `document.querySelector('#portfolio-ai-question').focus()`,
  );

  if (screenshotDir) {
    await client.send("Page.bringToFront");
    await wait(150);
    const screenshot = await client.send("Page.captureScreenshot", {
      captureBeyondViewport: false,
      format: "png",
    });
    await writeFile(
      join(screenshotDir, `nikki-ai-${viewport.name}.png`),
      Buffer.from(screenshot.data, "base64"),
    );
  }

  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      const value = 'Line one\\nLine two\\nLine three\\nLine four\\nLine five\\nLine six';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
    })()`,
  );
  await wait(150);
  const composerState = await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      const sendButton = document.querySelector('button[aria-label="Send message to Nikki AI"]');
      return {
        textareaHeight: Math.round(textarea.getBoundingClientRect().height),
        sendButtonHeight: Math.round(sendButton.getBoundingClientRect().height),
      };
    })()`,
  );
  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, '');
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
    })()`,
  );

  await evaluate(
    client,
    `(() => {
      const sendButton = document.querySelector('button[aria-label="Send message to Nikki AI"]');
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
      document.querySelector('button[aria-label="Send message to Nikki AI"]').click();
    })()`,
  );
  await wait(100);
  const loadingState = await evaluate(
    client,
    `(() => {
      const text = document.body.innerText;
      return text.includes("Thinking...") || text.includes("My main technical skills");
    })()`,
  );
  await wait(900);
  const answeredState = await evaluate(
    client,
    `(() => {
      const text = document.body.innerText;
      return text.includes("My main technical skills") && text.includes("software testing");
    })()`,
  );

  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      textarea.focus();
      const value = "Can I download your resume?";
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
      document.querySelector('button[aria-label="Send message to Nikki AI"]').click();
    })()`,
  );
  await wait(900);
  const resumeState = await evaluate(
    client,
    `(() => {
      const text = document.body.innerText;
      const links = [...document.querySelectorAll('a')];
      return {
        hasMessage: text.includes("Here is my resume. You can view or download it below."),
        hasCard: Boolean(document.querySelector('[data-message-type="file"]')),
        hasView: links.some((link) => link.textContent.includes("View Resume") && link.getAttribute("href") === "/resume/Nikki_Neil_Carino_CV.pdf"),
        hasDownload: links.some((link) => link.textContent.includes("Download Resume") && link.getAttribute("download") === "Nikki_Neil_Carino_CV.pdf"),
        exposesPath: text.includes("/resume/Nikki_Neil_Carino_CV.pdf"),
      };
    })()`,
  );

  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      textarea.focus();
      const value = "contact details";
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
      document.querySelector('button[aria-label="Send message to Nikki AI"]').click();
    })()`,
  );
  await wait(900);
  const contactState = await evaluate(
    client,
    `(() => {
      const links = [...document.querySelectorAll('a')].map((link) => link.getAttribute("href"));
      return {
        hasCard: Boolean(document.querySelector('[data-message-type="links"]')),
        hasEmail: links.includes("mailto:nikkineil.carino@gmail.com"),
        hasPhone: links.includes("tel:+639493433164"),
        hasGithub: links.includes("https://github.com/nikkineilcarino"),
        hasPortfolio: links.includes("https://carino-portfolio.vercel.app"),
      };
    })()`,
  );

  if (screenshotDir) {
    await client.send("Page.bringToFront");
    await wait(150);
    const screenshot = await client.send("Page.captureScreenshot", {
      captureBeyondViewport: false,
      format: "png",
    });
    await writeFile(
      join(screenshotDir, `nikki-ai-structured-${viewport.name}.png`),
      Buffer.from(screenshot.data, "base64"),
    );
  }

  await evaluate(
    client,
    `document.querySelector('button[aria-label="Reset portfolio AI conversation"]').click()`,
  );
  await wait(200);

  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector('#portfolio-ai-question');
      textarea.focus();
      const value = 'Tell me about RecycLens.';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
      document.querySelector('button[aria-label="Send message to Nikki AI"]').click();
    })()`,
  );
  await wait(900);
  const projectState = await evaluate(
    client,
    `(() => {
      const projectCards = [...document.querySelectorAll('[data-message-type="project"]')];
      const card = projectCards.at(-1);
      return {
        hasCard: Boolean(card),
        hasName: card?.textContent.includes('RecycLens') ?? false,
        hasSummary: card?.textContent.includes('proper waste disposal') ?? false,
        hasTechnologies: Boolean(card?.querySelector('[aria-label="Project technologies"]')),
        horizontalOverflow: card ? card.scrollWidth > card.clientWidth : true,
      };
    })()`,
  );

  if (screenshotDir) {
    await client.send("Page.bringToFront");
    await wait(150);
    const screenshot = await client.send("Page.captureScreenshot", {
      captureBeyondViewport: false,
      format: "png",
    });
    await writeFile(
      join(screenshotDir, `nikki-ai-project-${viewport.name}.png`),
      Buffer.from(screenshot.data, "base64"),
    );
  }

  await evaluate(
    client,
    `document.querySelector('button[aria-label="Reset portfolio AI conversation"]').click()`,
  );
  await wait(200);

  await evaluate(
    client,
    `(() => {
      const answer = ${JSON.stringify(richMarkdownAnswer)};
      window.__portfolioAiOriginalFetch = window.fetch;
      window.fetch = (input, init) => {
        if (String(input).includes('/api/portfolio-ai')) {
          return Promise.resolve(new Response(JSON.stringify({
            answer,
            message: { type: 'text', message: answer },
            mode: 'ai',
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }));
        }

        return window.__portfolioAiOriginalFetch(input, init);
      };

      const textarea = document.querySelector('#portfolio-ai-question');
      textarea.focus();
      const value = 'Show the rich answer QA fixture.';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
      document.querySelector('button[aria-label="Send message to Nikki AI"]').click();
    })()`,
  );
  await wait(500);

  if (screenshotDir) {
    await client.send("Page.bringToFront");
    await wait(150);
    const screenshot = await client.send("Page.captureScreenshot", {
      captureBeyondViewport: false,
      format: "png",
    });
    await writeFile(
      join(screenshotDir, `nikki-ai-rich-${viewport.name}.png`),
      Buffer.from(screenshot.data, "base64"),
    );
  }

  const richMarkdownState = await evaluate(
    client,
    `(async () => {
      window.fetch = window.__portfolioAiOriginalFetch;
      const assistantMessages = [...document.querySelectorAll('[data-message-role="assistant"]')];
      const message = assistantMessages.at(-1);
      const links = [...message.querySelectorAll('a')];
      const safeLink = links.find((link) => link.textContent.includes('Official documentation'));
      const answerCopy = message.querySelector('[data-copy-kind="answer"]');
      const codeCopy = message.querySelector('[data-copy-kind="code"]');

      answerCopy?.click();
      codeCopy?.click();
      await new Promise((resolve) => setTimeout(resolve, 150));

      return {
        hasHeading: Boolean(message.querySelector('h2')),
        hasList: message.querySelectorAll('li').length === 2,
        hasInlineCode: [...message.querySelectorAll('code')].some((node) => node.textContent === 'inline code'),
        hasCodeBlock: Boolean(message.querySelector('pre code')) && message.textContent.includes('console.log(value);'),
        hasBlockquote: Boolean(message.querySelector('blockquote')),
        safeLinkTarget: safeLink?.getAttribute('target') ?? null,
        safeLinkRel: safeLink?.getAttribute('rel') ?? null,
        unsafeLinkRendered: links.some((link) => link.textContent.includes('Unsafe action')),
        unsafeProtocolRendered: links.some((link) => /^(javascript|data):/i.test(link.getAttribute('href') ?? '')),
        rawHtmlRendered: Boolean(message.querySelector('#raw-html-escape, script')) || message.textContent.includes('Raw HTML must not render.'),
        scriptExecuted: window.__portfolioMarkdownXss === true,
        answerCopyLabel: answerCopy?.getAttribute('aria-label') ?? null,
        codeCopyLabel: codeCopy?.getAttribute('aria-label') ?? null,
        messageContained: message.scrollWidth <= message.clientWidth,
        pageOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    })()`,
  );

  await evaluate(
    client,
    `(() => {
      window.__portfolioAiOriginalFetch = window.fetch;
      window.fetch = () => Promise.resolve(new Response(JSON.stringify({
        message: {
          type: 'links',
          message: 'Unsafe structured content',
          links: [{ label: 'Unsafe', href: 'javascript:alert(1)', kind: 'external' }],
        },
        mode: 'ai',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      const textarea = document.querySelector('#portfolio-ai-question');
      textarea.focus();
      const value = 'Render a malformed structured message.';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, value);
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
      document.querySelector('button[aria-label="Send message to Nikki AI"]').click();
    })()`,
  );
  await wait(400);
  const malformedStructuredState = await evaluate(
    client,
    `(() => {
      window.fetch = window.__portfolioAiOriginalFetch;
      const assistantMessages = [...document.querySelectorAll('[data-message-role="assistant"]')];
      const message = assistantMessages.at(-1);
      return {
        hasSafeFallback: message.textContent.includes('I can still help with questions about my experience'),
        hasUnsafeCard: message.textContent.includes('Unsafe structured content'),
        hasUnsafeLink: Boolean(message.querySelector('a[href^="javascript:"]')),
      };
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
      document.querySelector('button[aria-label="Send message to Nikki AI"]').click();
    })()`,
  );
  await wait(900);
  const longInputState = await evaluate(
    client,
    `(() => {
      const panel = document.querySelector('aside[aria-label="Nikki AI assistant"] [id]');
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
      document.querySelector('button[aria-label="Send message to Nikki AI"]').click();
    })()`,
  );
  await wait(600);
  const errorState = await evaluate(
    client,
    `(() => {
      window.fetch = window.__portfolioAiOriginalFetch;
      return document.body.innerText.includes("I can still help with questions about my experience");
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
      const focusContainer = active.parentElement;
      const containerStyles = focusContainer ? getComputedStyle(focusContainer) : null;
      return {
        tag: active.tagName,
        id: active.id,
        ariaLabel: active.getAttribute('aria-label'),
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor,
        containerBoxShadow: containerStyles?.boxShadow ?? null,
        containerBorderColor: containerStyles?.borderColor ?? null,
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
      document.querySelector('button[aria-label="Open Nikki AI"]').click();
      const panel = document.querySelector('.portfolio-ai-panel');
      const animationDuration = panel ? getComputedStyle(panel).animationDuration : '0s';
      const durationValue = Number.parseFloat(animationDuration) || 0;
      const animationDurationMs = animationDuration.endsWith('ms')
        ? durationValue
        : durationValue * 1000;
      return {
        reducedMotionMedia: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        animationDurationMs,
      };
    })()`,
  );

  return {
    viewport: viewport.name,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    closedState,
    openState,
    focusOrderState,
    composerState,
    emptyInputState,
    loadingState,
    answeredState,
    resumeState,
    contactState,
    projectState,
    richMarkdownState,
    malformedStructuredState,
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

  if (!result.closedState.hasButton) failures.push(`${width}: missing Nikki AI launcher`);
  if (result.closedState.buttonHeight < 44) failures.push(`${width}: Nikki AI launcher is below 44px`);
  if (result.closedState.horizontalOverflow) failures.push(`${width}: closed state has horizontal overflow`);
  if (!result.openState.hasPanel) failures.push(`${width}: panel did not open`);
  if (!result.openState.hasTextarea) failures.push(`${width}: textarea missing`);
  if (!result.openState.hasSendButton) failures.push(`${width}: send button missing`);
  if (!result.openState.greetingVisible) failures.push(`${width}: greeting missing`);
  if (result.openState.activeElementId !== "portfolio-ai-question") failures.push(`${width}: opening did not focus the composer`);
  if (result.focusOrderState.ariaLabel !== "Send message to Nikki AI") failures.push(`${width}: composer focus order did not reach Send next`);
  if (result.openState.launcherVisible) failures.push(`${width}: launcher remains visible behind open panel`);
  if (result.openState.suggestionCount !== 3) failures.push(`${width}: expected three starter prompts`);
  if (result.openState.assistantTextBorderWidth !== "0px") failures.push(`${width}: assistant prose is still framed`);
  if (result.openState.panelBackground !== "rgb(255, 255, 255)") failures.push(`${width}: panel is not opaque`);
  if (result.openState.horizontalOverflow) failures.push(`${width}: open state has horizontal overflow`);
  if (result.openState.panelLeft < 0) failures.push(`${width}: panel overflows left`);
  if (result.openState.panelRight > result.viewportWidth) failures.push(`${width}: panel overflows right`);
  if (result.openState.panelTop < 0) failures.push(`${width}: panel overflows top`);
  if (result.openState.panelBottom > result.viewportHeight) failures.push(`${width}: panel overflows bottom`);
  if (result.viewport === "mobile" && result.openState.panelHeight < result.viewportHeight - 24) {
    failures.push(`${width}: mobile panel is not near full screen`);
  }
  if (result.viewport !== "mobile" && result.openState.panelWidth < 500) {
    failures.push(`${width}: desktop reading surface is too narrow`);
  }
  if (result.composerState.textareaHeight <= 44 || result.composerState.textareaHeight > 128) {
    failures.push(`${width}: composer did not auto-grow within its bounds`);
  }
  if (result.composerState.sendButtonHeight < 40) failures.push(`${width}: send control is unstable`);
  if (!result.emptyInputState) failures.push(`${width}: empty-input error missing`);
  if (!result.loadingState) failures.push(`${width}: request lifecycle state missing`);
  if (!result.answeredState) failures.push(`${width}: answer state missing expected content`);
  if (!result.resumeState.hasMessage) failures.push(`${width}: resume message missing`);
  if (!result.resumeState.hasCard) failures.push(`${width}: resume card missing`);
  if (!result.resumeState.hasView) failures.push(`${width}: View Resume link missing`);
  if (!result.resumeState.hasDownload) failures.push(`${width}: Download Resume link missing`);
  if (result.resumeState.exposesPath) failures.push(`${width}: resume path is visible in chat text`);
  if (!result.contactState.hasEmail) failures.push(`${width}: email link missing`);
  if (!result.contactState.hasCard) failures.push(`${width}: contact card missing`);
  if (!result.contactState.hasPhone) failures.push(`${width}: phone link missing`);
  if (!result.contactState.hasGithub) failures.push(`${width}: GitHub link missing`);
  if (!result.contactState.hasPortfolio) failures.push(`${width}: portfolio link missing`);
  if (!result.projectState.hasCard) failures.push(`${width}: project card missing`);
  if (!result.projectState.hasName) failures.push(`${width}: project name missing`);
  if (!result.projectState.hasSummary) failures.push(`${width}: project summary missing`);
  if (!result.projectState.hasTechnologies) failures.push(`${width}: project technologies missing`);
  if (result.projectState.horizontalOverflow) failures.push(`${width}: project card overflowed horizontally`);
  if (!result.richMarkdownState.hasHeading) failures.push(`${width}: Markdown heading missing`);
  if (!result.richMarkdownState.hasList) failures.push(`${width}: Markdown list missing`);
  if (!result.richMarkdownState.hasInlineCode) failures.push(`${width}: inline code missing`);
  if (!result.richMarkdownState.hasCodeBlock) failures.push(`${width}: fenced code block missing`);
  if (!result.richMarkdownState.hasBlockquote) failures.push(`${width}: blockquote missing`);
  if (result.richMarkdownState.safeLinkTarget !== "_blank") failures.push(`${width}: safe external link target missing`);
  if (!result.richMarkdownState.safeLinkRel?.includes("noopener")) failures.push(`${width}: safe external link rel missing`);
  if (result.richMarkdownState.unsafeLinkRendered) failures.push(`${width}: unsafe Markdown link remained clickable`);
  if (result.richMarkdownState.unsafeProtocolRendered) failures.push(`${width}: unsafe Markdown protocol rendered`);
  if (result.richMarkdownState.rawHtmlRendered) failures.push(`${width}: raw Markdown HTML rendered`);
  if (result.richMarkdownState.scriptExecuted) failures.push(`${width}: Markdown script executed`);
  if (result.richMarkdownState.answerCopyLabel !== "Copied answer") failures.push(`${width}: answer copy feedback missing`);
  if (result.richMarkdownState.codeCopyLabel !== "Copied code") failures.push(`${width}: code copy feedback missing`);
  if (!result.richMarkdownState.messageContained) failures.push(`${width}: rich answer escaped its message container`);
  if (result.richMarkdownState.pageOverflow) failures.push(`${width}: rich answer caused page overflow`);
  if (!result.malformedStructuredState.hasSafeFallback) failures.push(`${width}: malformed structured message did not fall back safely`);
  if (result.malformedStructuredState.hasUnsafeCard) failures.push(`${width}: malformed structured content rendered`);
  if (result.malformedStructuredState.hasUnsafeLink) failures.push(`${width}: malformed structured link rendered`);
  if (result.longInputState.horizontalOverflow) failures.push(`${width}: long input caused horizontal overflow`);
  if (!result.errorState) failures.push(`${width}: forced error state missing`);
  if (
    result.focusState.outlineStyle === "none" &&
    result.focusState.boxShadow === "none" &&
    result.focusState.borderColor !== "rgb(37, 99, 235)" &&
    result.focusState.containerBoxShadow === "none" &&
    result.focusState.containerBorderColor !== "rgb(37, 99, 235)"
  ) {
    failures.push(`${width}: focused control has no visible focus style`);
  }
  if (result.escapeState.panelStillOpen) failures.push(`${width}: Escape did not close panel`);
  if (!result.reducedMotionState.reducedMotionMedia) failures.push(`${width}: reduced-motion media not active`);
  if (result.reducedMotionState.animationDurationMs > 1) failures.push(`${width}: reduced-motion panel animation is too long`);

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
  await client.send("Network.enable");
  await client.send("Browser.grantPermissions", {
    origin: new URL(baseUrl).origin,
    permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
  });

  if (screenshotDir) {
    await mkdir(screenshotDir, { recursive: true });
  }

  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1366, height: 900 },
    { name: "wide-desktop", width: 1920, height: 1080 },
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
