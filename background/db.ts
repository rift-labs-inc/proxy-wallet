import { Storage } from "@plasmohq/storage";
import { SwapStatus } from "./types";

async function getStorage(): Promise<Storage> {
  const storage = new Storage({
    area: "local"
  })
  return storage;
}

export async function getWalletFromOrderNonce(orderNonceHex: string): Promise<{ address: string; privateKey: string; mnemonic: string, associatedOrderNonceHex: string }> {
  const wallets = await getWallets();
  return wallets.find((wallet) => wallet.associatedOrderNonceHex === orderNonceHex);
}

export async function getWallets(): Promise<[{ address: string; privateKey: string; mnemonic: string, associatedOrderNonceHex: string }]> {
  const storage = await getStorage();
  const wallets = await storage.get("wallets");
  return wallets ? JSON.parse(wallets) : [];
}

export async function addWallet(wallet: { address: string; privateKey: string; mnemonic: string, associatedOrderNonceHex: string } ): Promise<void> {
  const storage = await getStorage();
  const wallets = await getWallets();
  wallets.push(wallet);
  await storage.set("wallets", JSON.stringify(wallets));
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
