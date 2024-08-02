import riftWindowApi from "./riftWindowApi";
import messageRelay from "./messageRelay";
import {RIFT_URL_PATTERN} from "./constants";

export default function injectRiftCS() {
  const injectedTabs = {};

  const inject = async (tabId: number, func: () => void, world: chrome.scripting.ExecutionWorld) => {
    chrome.scripting.executeScript({
      target: { tabId },
      func,
      world,
    });
  };

  function injectScripts(tabId: number, url: string) {
    if (!RIFT_URL_PATTERN.test(url)) {
      console.log(`Not injecting Rift into tab ${tabId}: URL doesn't match`);
      return;
    }

    if (injectedTabs[tabId]) {
      console.log(`Rift already injected into tab ${tabId}`);
      return;
    }

    console.log(`Injecting Rift into tab ${tabId}`);
    inject(tabId, riftWindowApi, "MAIN");
    inject(tabId, messageRelay, "ISOLATED");
    injectedTabs[tabId] = true;
  }

  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url) {
        injectScripts(activeInfo.tabId, tab.url);
      }
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active && tab.url) {
      injectedTabs[tabId] = false;
      injectScripts(tabId, tab.url);
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    delete injectedTabs[tabId];
  });
}
