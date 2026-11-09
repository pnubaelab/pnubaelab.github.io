// Fetch optional libraries only when the current document contains their widgets.
// Keep each chain ordered: plugins must be available before their setup runs.
(() => {
  const load = (options) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = options.src;
      script.async = false;
      if (options.integrity) {
        script.integrity = options.integrity;
        script.crossOrigin = "anonymous";
      }
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${options.src}`));
      document.head.appendChild(script);
    });

  document.querySelectorAll("script[data-optional-scripts]").forEach((config) => {
    if (!document.querySelector(config.dataset.selector)) return;
    const scripts = JSON.parse(config.textContent);
    scripts.reduce((chain, options) => chain.then(() => load(options)), Promise.resolve()).catch((error) => console.error(error));
  });
})();
