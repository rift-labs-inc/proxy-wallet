import riftWindowApi from "./riftWindowApi";
import messageRelay from "./messageRelay";

export default function injectRiftCS() {
  const injectedTabs = {};

  const inject = async (tabId: number, func: () => void, world: chrome.scripting.ExecutionWorld) => {
    chrome.scripting.executeScript({
      target: {
        tabId,
      },
      func,
      world,
    })
  }

  function injectScripts(tabId) {
    // Check if the tab has been injected already
    if (injectedTabs[tabId]) {
      console.log(`Rift already injected into tab ${tabId}`);
      return;
    }

    console.log(`Injecting Rift into tab ${tabId}`);
    // Proceed with injection
    inject(tabId, riftWindowApi, "MAIN");
    inject(tabId, messageRelay, "ISOLATED");
    injectedTabs[tabId] = true;
  }

  // Listen for when a tab is activated (switched to).
  chrome.tabs.onActivated.addListener((activeInfo) => {
    injectScripts(activeInfo.tabId);
  });

  // Listen for when a tab is updated (reloaded or navigated to a new URL).
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      injectedTabs[tabId] = false;
      injectScripts(tabId);
    }
  });

  // Clean up when a tab is closed
  chrome.tabs.onRemoved.addListener((tabId) => {
    delete injectedTabs[tabId];
  });
}
