// BGSW Rift API
import {
  buildWalletFromMnemonic,
  estimateRiftPaymentTransactionFees,
  executeRiftSwapOnAvailableUTXO,
  generateP2WPKH
} from "./bitcoin"
import * as storage from "./db"
import {
  CreateRiftSwapArgs,
  GetProxyWalletArgs,
  GetProxyWalletResponse,
  GetRiftSwapFeesArgs,
  GetRiftSwapStatusArgs,
  ProxyWalletStatus,
  RiftSwapFees,
  SwapStatus
} from "./types"

export const MEMPOOL_HOST = "https://mempool.space"

async function _getProxyWallet(orderNonceHex: string): Promise<{
  address: string
  privateKey: string
  mnemonic: string
}> {

  const wallet = await storage.getWalletFromOrderNonce(orderNonceHex);
  if (wallet) {
    return wallet;
  }
  // otherwise generate new
  const newWallet = generateP2WPKH(orderNonceHex);
  await storage.addWallet(newWallet)
  return newWallet 
}

export const RiftApi = {
  async getProxyWallet(
    args: GetProxyWalletArgs
  ): Promise<GetProxyWalletResponse> {
    return { address: (await _getProxyWallet(args.orderNonceHex)).address }
  },

  async getRiftSwapFees(args: GetRiftSwapFeesArgs): Promise<RiftSwapFees> {
    const mnemonic = "ladder crystal wool wheat fossil large unable firm vicious index index outer";
    let wallet = buildWalletFromMnemonic(mnemonic)

    return await estimateRiftPaymentTransactionFees(
      args.lps,
      wallet,
      MEMPOOL_HOST
    )
  },

  async createRiftSwap(args: CreateRiftSwapArgs): Promise<ProxyWalletStatus> {
    console.log("Creating rift swap with args:", args)
    const newSwap = {
      ...args,
      status: SwapStatus.WAITING_FOR_FUNDING_TRANSACTION,
      id: args.orderNonceHex,
      paymentTxid: ""
    }

    const swaps = await storage.getSwaps()
    swaps.push(newSwap)
    await storage.setSwaps(swaps)

    const { mnemonic } = await _getProxyWallet(args.orderNonceHex)
    console.log("Waiting for rift swap on available UTXO")
    // TODO: Grab a custom mempool host if the user provided one in options
    // This is purposefully not being awaited because this function is meant to be fire-and-forget
    executeRiftSwapOnAvailableUTXO(args, mnemonic, MEMPOOL_HOST, newSwap.id)

    return {
      status: newSwap.status,
      paymentTxid: newSwap.paymentTxid,
      internalId: newSwap.id
    }
  },

  async getRiftSwapStatus(
    args: GetRiftSwapStatusArgs
  ): Promise<ProxyWalletStatus> {
    const swaps = await storage.getSwaps()
    const swap = swaps.find((swap: any) => swap.id === args.internalId)
    if (!swap) {
      throw new Error("No swap found with that ID")
    }
    return {
      status: swap.status,
      paymentTxid: swap.paymentTxid,
      internalId: swap.id
    }
  },

  async getAllRiftSwapStatuses(): Promise<ProxyWalletStatus[]> {
    const swaps = await storage.getSwaps()
    return swaps.map((swap: any) => ({
      status: swap.status,
      paymentTxid: swap.paymentTxid,
      internalId: swap.id
    }))
  },

  async clearLocalSwaps() {
    await storage.clearSwaps()
  }
}
