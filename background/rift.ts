// BGSW Rift API
import { GetProxyWalletArgs, GetProxyWalletResponse, ProxyWalletStatus, CreateRiftSwapArgs, SwapStatus, GetRiftSwapStatusArgs } from "./types";
import { executeRiftSwapOnAvailableUTXO, generateP2WPKH } from "./bitcoin";
import * as storage from "./db";

async function _getProxyWallet(): Promise<{ address: string; privateKey: string; mnemonic: string }> {
  let wallet = await storage.getWallet();
  if (!wallet) {
    wallet = generateP2WPKH();
    await storage.setWallet(wallet);
  }
  return wallet;
}

export const RiftApi = {
  async getProxyWallet(args: GetProxyWalletArgs): Promise<GetProxyWalletResponse> {
    return { address: (await _getProxyWallet()).address };
  },

  async createRiftSwap(args: CreateRiftSwapArgs): Promise<ProxyWalletStatus> {
    const id = crypto.randomUUID();
    const newSwap = { ...args, status: SwapStatus.WAITING_FOR_FUNDING_TRANSACTION, id, paymentTxid: "" };
    
    const swaps = await storage.getSwaps();
    swaps.push(newSwap);
    await storage.setSwaps(swaps);

    const { mnemonic } = await _getProxyWallet();
    // TODO: Grab a custom mempool host if the user provided one in options
    // This is purposefully not being awaited because this function is meant to be fire-and-forget 
    executeRiftSwapOnAvailableUTXO(args, mnemonic, "https://mempool.space", newSwap.id);
    
    return { status: newSwap.status, paymentTxid: newSwap.paymentTxid, internalId: newSwap.id };
  },

  async getRiftSwapStatus(args: GetRiftSwapStatusArgs): Promise<ProxyWalletStatus> {
    const swaps = await storage.getSwaps();
    const swap = swaps.find((swap: any) => swap.id === args.internalId);
    if (!swap) {
      throw new Error("No swap found with that ID");
    }
    return { status: swap.status, paymentTxid: swap.paymentTxid, internalId: swap.id };
  },

  async getAllRiftSwapStatuses(): Promise<ProxyWalletStatus[]> {
    const swaps = await storage.getSwaps();
    return swaps.map((swap: any) => ({
      status: swap.status,
      paymentTxid: swap.paymentTxid,
      internalId: swap.id
    }));
  },

  async clearLocalSwaps() {
    await storage.clearSwaps();
  }
};
