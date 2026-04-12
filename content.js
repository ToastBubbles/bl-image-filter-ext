console.log("BrickLink filter running...");

let enabled = true;

// Load saved state and run filter if enabled
async function initialize() {
    const result = await browser.storage.local.get("enabled");
    enabled = result.enabled ?? true;

    console.log("Filter initialized with enabled =", enabled);

    if (enabled) {
        await waitForItems();   // your existing function
        filterAll();
    }
}

initialize();

// Listen for toggle from popup
browser.runtime.onMessage.addListener((message) => {
    if (message.type === "TOGGLE_FILTER") {
        enabled = message.enabled;
        console.log("Toggle received, enabled =", enabled);

        if (enabled) {
            filterAll();           // re-apply to current items
        } else {
            // Remove the hiding class
            document.querySelectorAll(".bl-stock-image")
                .forEach(el => el.classList.remove("bl-stock-image"));
        }
    }
});

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

    if (isStockImage(src)) {
        item.classList.add("bl-stock-image");
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