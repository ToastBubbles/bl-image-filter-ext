// console.log("BrickLink filter running...");
// // alert("CONTENT SCRIPT LOADED");
// let enabled = true;
// let mode = "grey";
// let hideKnown = true;
// // Load saved state and run filter if enabled
// async function initialize() {
//     console.log('********started*************');

//     const result = await browser.storage.local.get(["enabled", "mode", "hideKnown"]);

//     enabled = result.enabled ?? true;
//     mode = result.mode ?? "grey";
//     hideKnown = result.hideKnown ?? false;

//     console.log("Filter initialized with enabled =", enabled);

//     if (enabled) {
//         await waitForItems();   // your existing function
//         filterAll();
//     }
// }

// initialize();

// // Listen for toggle from popup
// browser.runtime.onMessage.addListener((message) => {
//     if (message.type === "UPDATE_SETTINGS") {
//         enabled = message.enabled ?? enabled;
//         mode = message.mode ?? mode;
//         hideKnown = message.hideKnown ?? hideKnown;

//         console.log("Updated settings:", enabled, mode, hideKnown);

//         refreshAll();
//     }
// });

// function refreshAll() {
//     document
//         .querySelectorAll("article.item.component.table-row")
//         .forEach(item => {
//             item.classList.remove("bl-stock-image");
//             item.classList.remove("special-image");
//         });

//     if (enabled) {
//         filterAll();
//     }
// }

// // Your existing helper functions
// function isStockImage(src) {
//     return src.includes("/ItemImage/");
// }

// function processItem(item) {
//     if (!enabled) return;

//     const img = item.querySelector("img");
//     if (!img) return;

//     let src = img.getAttribute("src") || img.getAttribute("data-src") || "";  // sometimes images use data-src
//     if (src.startsWith("//")) src = "https:" + src;

//     // if (isStockImage(src)) {
//     //     if (mode == 'speedy')
//     //         item.classList.add("bl-stock-image");
//     // } else {
//     //     item.classList.add("special-image");
//     // }
//     if (isStockImage(src)) {
//         if (mode === "speedy") {
//             item.remove();
//             return;
//         }


//     } else {
//         item.classList.add("special-image");
//     }
// }

// function filterAll() {
//     const items = document.querySelectorAll("article.item.component.table-row");
//     console.log(`Filtering ${items.length} items`);

//     items.forEach(processItem);

//     // NEW FEATURE
//     filterKnownColors();
// }

// // Wait for items to appear (you said this exists – if not, add a simple version)
// function waitForItems() {
//     return new Promise(resolve => {
//         if (document.querySelector("article.item.component.table-row")) {
//             return resolve();
//         }
//         const obs = new MutationObserver(() => {
//             if (document.querySelector("article.item.component.table-row")) {
//                 obs.disconnect();
//                 resolve();
//             }
//         });
//         obs.observe(document.body, { childList: true, subtree: true });
//     });
// }

// function getKnownColors() {
//     const knownSet = new Set();

//     const knownLabel = Array.from(document.querySelectorAll("div"))
//         .find(div => div.textContent.includes("Known Colors:"));

//     const knownSection = knownLabel?.closest("td");

//     if (!knownSection) return knownSet;

//     const links = knownSection.querySelectorAll("a");

//     links.forEach(link => {
//         const color = link.textContent.trim();
//         if (color) knownSet.add(color);
//     });

//     console.log("Known colors:", knownSet);

//     return knownSet;
// }

// function filterKnownColors() {
//     if (!hideKnown) return;

//     const knownColors = getKnownColors();

//     // const lotsSection = document.querySelectorAll("td")[0]; // first column
//     const lotsLabel = Array.from(document.querySelectorAll("div"))
//         .find(div => div.textContent.includes("Lots for sale"));

//     const lotsSection = lotsLabel?.closest("td");

//     const rows = lotsSection.querySelectorAll("div[style*='display:flex']");

//     rows.forEach(row => {
//         row.remove();
//         const link = row.querySelector("a");
//         if (!link) return;

//         const color = link.textContent.trim();

//         if (knownColors.has(color)) {
//             row.remove(); // 🔥 removes matching colors
//         }
//     });
// }

// // MutationObserver for dynamically loaded items (this part was already good)
// const observer = new MutationObserver((mutations) => {
//     if (!enabled) return;

//     mutations.forEach(mutation => {
//         mutation.addedNodes.forEach(node => {
//             if (!(node instanceof HTMLElement)) return;

//             if (node.matches?.("article.item.component.table-row")) {
//                 processItem(node);
//             }

//             node.querySelectorAll?.("article.item.component.table-row")
//                 .forEach(processItem);
//         });
//     });
// });

// observer.observe(document.body, { childList: true, subtree: true });