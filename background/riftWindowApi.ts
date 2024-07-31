 

export default function riftWindowApi() {
  // Here's an example where we can reference the window object
  // and add a new property to it
  window.rift = {
    connected: true,
    // you can call other functions from the injected script
    // but they must be declared inside the injected function
    // or be present in the global scope
    createTransaction: async () => {
      //receive info from content script   
      const resp = window.postMessage({
        data: {
          method: "ping",
          params: {} 
        },
        target: "rift-inpage"
      });
      console.log("Transaction created", resp);
    },
  }

  // Here's an example where we show you can reference the DOM
  // This console.log will show within the tab you injected into
  console.log("Rift has been injected into this tab");
}
