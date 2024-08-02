import {RIFT_URL_PATTERN} from "./constants";
import injectRiftCS from "./injectRiftCS";
import { RiftApi } from "./rift";

injectRiftCS();

export async function dispatchRequest(data: { data: { method: string; params: any } }, responseCallback: Function) {
  const { method, params } = data.data;
  
  if (typeof (RiftApi as any)[method] === 'function') {
    try {
      const result = await (RiftApi as any)[method](params);
      responseCallback(result);
    } catch (error) {
      console.error(`Error in method ${method}:`, error);
      responseCallback({ error: `Error executing ${method}` });
    }
  } else {
    console.error("Unknown method:", method);
    responseCallback({ error: `Unknown method: ${method}` });
  }
}


chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  if (sender.tab && sender.tab.url && RIFT_URL_PATTERN.test(sender.tab.url)) {
    // Return true to indicate that we will be sending a response asynchronously
    dispatchRequest(data, sendResponse);
    return true;
  } else {
    console.log("Ignoring message from non-Rift tab:", sender.tab?.url);
    return false;
  }
});

console.log("Background script loaded");
