console.log("BrickLink filter running...");

let enabled = true;
let mode = "grey";

// Load saved state and run filter if enabled
async function initialize() {
    const result = await browser.storage.local.get(["enabled", "mode"]);

    enabled = result.enabled ?? true;
    mode = result.mode ?? "grey";

    console.log("Filter initialized with enabled =", enabled);

    if (enabled) {
        await waitForItems();   // your existing function
        filterAll();
    }
}

initialize();

// Listen for toggle from popup
browser.runtime.onMessage.addListener((message) => {
    if (message.type === "UPDATE_SETTINGS") {
        browser.storage.local.get(["enabled", "mode"]).then(result => {
            enabled = result.enabled ?? true;
            mode = result.mode ?? "grey";

            console.log("Updated settings:", enabled, mode);

            refreshAll();
        });
    }
});

function refreshAll() {
    document
        .querySelectorAll("article.item.component.table-row")
        .forEach(item => {
            item.classList.remove("bl-stock-image");
            item.classList.remove("special-image");
        });

    if (enabled) {
        filterAll();
    }
}

// Your existing helper functions
function isStockImage(src) {
    return src.includes("/ItemImage/");
}

function processItem(item) {
    if (!enabled) return;

    const img = item.querySelector("img");
    if (!img) return;

    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";  // sometimes images use data-src
    if (src.startsWith("//")) src = "https:" + src;

    // if (isStockImage(src)) {
    //     if (mode == 'speedy')
    //         item.classList.add("bl-stock-image");
    // } else {
    //     item.classList.add("special-image");
    // }
    if (isStockImage(src)) {
        if (mode === "speedy") {
            item.remove();
            return;
        }


    } else {
        item.classList.add("special-image");
    }
}

function filterAll() {
    const items = document.querySelectorAll("article.item.component.table-row");
    console.log(`Filtering ${items.length} items`);
    items.forEach(processItem);
}

// Wait for items to appear (you said this exists – if not, add a simple version)
function waitForItems() {
    return new Promise(resolve => {
        if (document.querySelector("article.item.component.table-row")) {
            return resolve();
        }
        const obs = new MutationObserver(() => {
            if (document.querySelector("article.item.component.table-row")) {
                obs.disconnect();
                resolve();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    });
}

// MutationObserver for dynamically loaded items (this part was already good)
const observer = new MutationObserver((mutations) => {
    if (!enabled) return;

    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (!(node instanceof HTMLElement)) return;

            if (node.matches?.("article.item.component.table-row")) {
                processItem(node);
            }

            node.querySelectorAll?.("article.item.component.table-row")
                .forEach(processItem);
        });
    });
});

observer.observe(document.body, { childList: true, subtree: true });