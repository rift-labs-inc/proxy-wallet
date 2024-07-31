export default function relay() {
  console.log("Relay content script loaded");

  window.addEventListener("message", async (event) => {
    if(event.data.target !== "rift-inpage") return;
    console.log("[ISOLATED] content script received message from page", event.data);
    chrome.runtime.sendMessage({data: event.data.data}, (response) => {
      console.log("[ISOLATED] content script received response from background", response);
    });
  }, false);
}
