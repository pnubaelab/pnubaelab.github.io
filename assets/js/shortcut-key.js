// Deferred scripts execute after readyState becomes interactive.
const updateSearchShortcut = () => {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcutKeyElement = document.querySelector("#search-toggle .nav-link");
  if (shortcutKeyElement && isMac) {
    shortcutKeyElement.innerHTML = '&#x2318; k <i class="ti ti-search"></i>';
  }
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateSearchShortcut, { once: true });
} else {
  updateSearchShortcut();
}
