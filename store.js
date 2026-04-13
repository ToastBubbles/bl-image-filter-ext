console.log("BrickLink STORE script running...");

let enabled = true;
let mode = "grey";

async function initialize() {
    const result = await browser.storage.local.get(["enabled", "mode"]);

    enabled = result.enabled ?? true;
    mode = result.mode ?? "grey";

    if (enabled) {
        await waitForItems();
        filterAll();
    }
}

initialize();

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "UPDATE_SETTINGS") {
        enabled = message.enabled ?? enabled;
        mode = message.mode ?? mode;

        refreshAll();
    }
});

function refreshAll() {
    document
        .querySelectorAll("article.item.component.table-row")
        .forEach(item => {
            item.classList.remove("bl-stock-image");
            item.classList.remove("special-image");
        });

    if (enabled) filterAll();
}

function isStockImage(src) {
    return src.includes("/ItemImage/");
}

function processItem(item) {
    if (!enabled) return;

    const img = item.querySelector("img");
    if (!img) return;

    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (src.startsWith("//")) src = "https:" + src;

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
    items.forEach(processItem);
}

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