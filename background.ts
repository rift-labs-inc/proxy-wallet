export {}


const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const main = async () => {
  while (true) {
    console.log("Rift Aliveness Ping");
    await sleep(10000);
  }
}

main().then(() => console.log("Background script finished"));



