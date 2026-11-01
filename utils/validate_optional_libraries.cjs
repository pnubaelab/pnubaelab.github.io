const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = (name) => fs.readFileSync(path.join(__dirname, "../assets/js", name), "utf8");
const flush = () => new Promise((resolve) => setImmediate(resolve));

async function checkLibraries({ present = true, failAt } = {}) {
  const requests = [];
  const errors = [];
  const configs = [{
    dataset: { selector: ".grid" },
    textContent: JSON.stringify([
      { src: "library.js", integrity: "sha256-library" },
      { src: "plugin.js" },
      { src: "setup.js" },
    ]),
  }];
  const document = {
    querySelectorAll: () => configs,
    querySelector: () => present ? {} : null,
    createElement: () => ({}),
    head: {
      appendChild(script) {
        requests.push(script);
        // Keep load completion asynchronous to exercise the dependency chain.
        queueMicrotask(() => script.src === failAt ? script.onerror() : script.onload());
      },
    },
  };
  vm.runInNewContext(source("optional-libraries.js"), {
    document,
    console: { error: (error) => errors.push(error.message) },
  });
  await flush();
  return { requests, errors };
}

function checkShortcut(platform, readyState, hasToggle = true) {
  const toggle = { innerHTML: "ctrl k" };
  let ready;
  const document = {
    readyState,
    querySelector: () => hasToggle ? toggle : null,
    addEventListener(event, callback, options) {
      assert.equal(event, "DOMContentLoaded");
      assert.equal(options.once, true);
      ready = callback;
    },
  };
  vm.runInNewContext(source("shortcut-key.js"), { document, navigator: { platform } });
  if (readyState === "loading") {
    assert.equal(toggle.innerHTML, "ctrl k", "must wait until markup is available");
    assert.equal(typeof ready, "function");
    ready();
  }
  assert.equal(toggle.innerHTML.includes("&#x2318;"), hasToggle && platform === "MacIntel");
}

(async () => {
  const absent = await checkLibraries({ present: false });
  assert.equal(absent.requests.length, 0, "pages without widgets must issue no requests");
  assert.equal(absent.errors.length, 0);

  const success = await checkLibraries();
  assert.deepEqual(success.requests.map((script) => script.src), ["library.js", "plugin.js", "setup.js"]);
  assert.ok(success.requests.every((script) => script.async === false));
  assert.equal(success.requests[0].integrity, "sha256-library");
  assert.equal(success.requests[0].crossOrigin, "anonymous");
  assert.equal(success.errors.length, 0);

  for (const failAt of ["library.js", "plugin.js"]) {
    const failed = await checkLibraries({ failAt });
    const expected = failAt === "library.js" ? ["library.js"] : ["library.js", "plugin.js"];
    assert.deepEqual(failed.requests.map((script) => script.src), expected, "failed dependencies must prevent setup");
    assert.deepEqual(failed.errors, [`Could not load ${failAt}`]);
  }

  for (const readyState of ["loading", "interactive", "complete"]) {
    checkShortcut("MacIntel", readyState);
    checkShortcut("Linux x86_64", readyState);
    checkShortcut("MacIntel", readyState, false);
  }
  console.log("Optional library selection, ordering, SRI, failure handling and search shortcut checks passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
