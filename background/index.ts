import injectRiftCS from "./injectRiftCS";

injectRiftCS();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[BACKGROUND] Received message from content script:", message);

  sendResponse({ message: "Message received" });
  // Return true to indicate that we will be sending a response asynchronously
  return true;
});

console.log("[BACKGROUND] Background script loaded");
