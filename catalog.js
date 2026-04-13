console.log("BrickLink CATALOG script running...");

let enabled = true;
let hideKnown = false;

async function initialize() {
    console.log("CATALOG INIT - starting");

    // Small delay helps a lot in Firefox MV3
    await new Promise(r => setTimeout(r, 100));

    const result = await browser.storage.local.get(["enabled", "hideKnown"]);

    enabled = result.enabled ?? true;
    hideKnown = result.hideKnown ?? false;

    console.log("Settings loaded:", { enabled, hideKnown });

    if (!enabled) {
        console.log("Extension disabled");
        return;
    }

    await waitForColorSections();

    console.log("DOM ready, running filter");
    filterKnownColors();
}
function waitForColorSections() {
    return new Promise(resolve => {
        const exists = () =>
            Array.from(document.querySelectorAll("div"))
                .some(div => div.textContent.includes("Known Colors:"));

        if (exists()) return resolve();

        const obs = new MutationObserver(() => {
            if (exists()) {
                obs.disconnect();
                resolve();
            }
        });

        obs.observe(document.body, { childList: true, subtree: true });
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "UPDATE_SETTINGS") {
        enabled = message.enabled ?? enabled;
        hideKnown = message.hideKnown ?? hideKnown;

        console.log("Settings updated via popup:", { enabled, hideKnown });

        refreshAll();
    }
});

function refreshAll() {
    document
        .querySelectorAll(".bl-hidden-known")
        .forEach(el => el.classList.remove("bl-hidden-known"));

    if (enabled) filterKnownColors();
}

function getKnownColors() {
    const knownSet = new Set();

    const knownLabel = Array.from(document.querySelectorAll("div.pciColorTitle"))
        .find(div => div.textContent.includes("Known Colors:"));

    const knownSection = knownLabel?.closest("td");
    if (!knownSection) return knownSet;

    const links = knownSection.querySelectorAll("a");

    links.forEach(link => {
        const color = link.textContent.trim().toLowerCase();
        if (color) knownSet.add(color);
    });

    console.log("Known colors:", knownSet);




    return knownSet;
}

function filterKnownColors() {
    if (!hideKnown) return;

    console.log('preparing to filter');

    const knownColors = getKnownColors();

    const lotsLabel = Array.from(document.querySelectorAll("div.pciColorTitle"))
        .find(div => div.textContent.includes("Lots For Sale:"));

    console.log(lotsLabel);


    const lotsSection = lotsLabel?.closest("td");
    if (!lotsSection) return;

    // const lotsSection = Array.from(document.querySelectorAll("td"))
    //     .find(td => td !== lotsSection);

    // if (!lotsSection) return;

    const rows = lotsSection.querySelectorAll("div[style*='display:flex']");

    rows.forEach(row => {
        const link = row.querySelector("a");
        if (!link) return;

        const color = link.textContent.trim().toLowerCase();

        if (!knownColors.has(color)) {
            row.classList.add("bl-glow-known");
            // row.remove()
        }
    });
}