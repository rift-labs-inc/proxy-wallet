export default function relay() {
  window.addEventListener("message", async (event) => {
    if (event.data.target !== "rift-inpage") return;
    chrome.runtime.sendMessage({data: event.data.data}, (response) => {
      window.postMessage({
        messageId: event.data.data.messageId,
        response: response,
        target: "rift-page-response"
      }, "*");
    });
  }, false);

  console.log("[ISOLATED] Rift has been injected...");
}
