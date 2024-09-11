import { Storage } from "@plasmohq/storage";
import { SwapStatus } from "./types";

async function getStorage(): Promise<Storage> {
  const storage = new Storage({
    area: "local"
  })
  return storage;
}

export async function getWallet(): Promise<{ address: string; privateKey: string; mnemonic: string } | null> {
  const storage = await getStorage();
  const wallet = await storage.get("wallet");
  return wallet ? JSON.parse(wallet) : null;
}

export async function setWallet(wallet: { address: string; privateKey: string; mnemonic: string }): Promise<void> {
  const storage = await getStorage();
  await storage.set("wallet", JSON.stringify(wallet));
}

export async function getSwaps(): Promise<any[]> {
  const storage = await getStorage();
  const swaps = await storage.get("swaps");
  return swaps ? JSON.parse(swaps) : [];
}

export async function setSwaps(swaps: any[]): Promise<void> {
  const storage = await getStorage();
  await storage.set("swaps", JSON.stringify(swaps));
}

export async function updateSwapStatus(internalId: string, status: SwapStatus, paymentTxid: string): Promise<void> {
  const swaps = await getSwaps();
  const newSwaps = swaps.map((swap: any) => {
    if (swap.id === internalId) {
      return { ...swap, status, paymentTxid };
    }
    return swap;
  });
  await setSwaps(newSwaps);
}

export async function clearSwaps(): Promise<void> {
  const storage = await getStorage();
  await storage.remove("swaps");
}
