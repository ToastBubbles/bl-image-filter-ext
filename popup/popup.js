const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

// Load saved state
browser.storage.local.get("enabled").then(result => {
  const enabled = result.enabled ?? true; // default ON
  toggle.checked = enabled;
  updateStatus(enabled);
});

// When toggled
toggle.addEventListener("change", () => {
  const enabled = toggle.checked;

  browser.storage.local.set({ enabled });

  updateStatus(enabled);

  // Notify content script
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    browser.tabs.sendMessage(tabs[0].id, {
      type: "TOGGLE_FILTER",
      enabled
    });
  });
});

function updateStatus(enabled) {
  status.textContent = enabled ? "Enabled" : "Disabled";
}