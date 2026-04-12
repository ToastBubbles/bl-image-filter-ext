const toggleEnabled = document.getElementById("toggle");
const speedyMode = document.getElementById("speedyMode");
const status = document.getElementById("status");

// Load state
browser.storage.local.get(["enabled", "mode"]).then(result => {
    const enabled = result.enabled ?? true;
    const mode = result.mode ?? "grey";

    browser.storage.local.set({ enabled, mode });

    toggleEnabled.checked = enabled;
    speedyMode.checked = mode === "speedy";

    updateStatus(enabled, mode);
});

// Enabled toggle
toggleEnabled.addEventListener("change", () => {
    browser.storage.local.set({ enabled: toggleEnabled.checked });

    sendUpdate();
});

// Speedy toggle
speedyMode.addEventListener("change", () => {
    const mode = speedyMode.checked ? "speedy" : "grey";

    browser.storage.local.set({ mode });

    sendUpdate();
});

function sendUpdate() {
    browser.storage.local.get(["enabled", "mode"]).then(result => {
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            browser.tabs.sendMessage(tabs[0].id, {
                type: "UPDATE_SETTINGS",
                enabled: result.enabled,
                mode: result.mode
            });
        });
    });
}

function updateStatus(enabled, mode) {
    status.textContent =
        !enabled ? "Disabled" :
            mode === "speedy" ? "Speedy mode ON" :
                "Grey mode ON";
}