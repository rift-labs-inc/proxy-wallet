import {
  CreateRiftSwapArgs,
  GetProxyWalletArgs,
  GetProxyWalletResponse,
  GetRiftSwapFeesArgs,
  GetRiftSwapStatusArgs,
  ProxyWalletStatus,
  RiftSwapFees
} from "./types"

declare global {
  interface Window {
    rift: {
      connected: boolean
      getProxyWallet: (
        args: GetProxyWalletArgs
      ) => Promise<GetProxyWalletResponse>
      createRiftSwap: (args: CreateRiftSwapArgs) => Promise<ProxyWalletStatus>
      getRiftSwapStatus: (
        args: GetRiftSwapStatusArgs
      ) => Promise<ProxyWalletStatus>
      getAllRiftSwapStatuses: () => Promise<ProxyWalletStatus[]>
      getRiftSwapFees: (args: GetRiftSwapFeesArgs) => Promise<RiftSwapFees>
      clearLocalSwaps: () => void
    }
  }
}
export default function riftWindowApi() {
  function sendToBackgroundViaRelay<T>(
    method: string,
    params = {}
  ): Promise<T> {
    return new Promise<T>((resolve) => {
      const messageId = Date.now().toString()
      const messageListener = (event: MessageEvent) => {
        if (
          event.data.target === "rift-page-response" &&
          event.data.messageId === messageId
        ) {
          resolve(event.data.response as T)
          window.removeEventListener("message", messageListener)
        }
      }
      window.addEventListener("message", messageListener)
      window.postMessage(
        {
          data: {
            method,
            params,
            messageId
          },
          target: "rift-inpage"
        },
        "*"
      )
    })
  }
  // this has to be built without any dependencies, so it can't be be programmatically created
  window.rift = {
    connected: true,
    getProxyWallet: async (
      args: GetProxyWalletArgs
    ): Promise<GetProxyWalletResponse> =>
      await sendToBackgroundViaRelay<GetProxyWalletResponse>(
        "getProxyWallet",
        args
      ),
    createRiftSwap: async (
      args: CreateRiftSwapArgs
    ): Promise<ProxyWalletStatus> =>
      await sendToBackgroundViaRelay<ProxyWalletStatus>("createRiftSwap", args),
    getRiftSwapStatus: async (
      args: GetRiftSwapStatusArgs
    ): Promise<ProxyWalletStatus> =>
      await sendToBackgroundViaRelay<ProxyWalletStatus>(
        "getRiftSwapStatus",
        args
      ),
    getAllRiftSwapStatuses: async (): Promise<ProxyWalletStatus[]> =>
      await sendToBackgroundViaRelay<ProxyWalletStatus[]>(
        "getAllRiftSwapStatuses"
      ),
    clearLocalSwaps: async () =>
      await sendToBackgroundViaRelay<void>("clearLocalSwaps"),
    getRiftSwapFees: async (args: GetRiftSwapFeesArgs) =>
      await sendToBackgroundViaRelay<RiftSwapFees>("getRiftSwapFees", args)
  }
  console.log("[MAIN] Rift has been injected...")
}
