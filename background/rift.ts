// BGSW Rift API
import { GetProxyWalletArgs, GetProxyWalletResponse } from "./types";
import { SecureStorage } from "@plasmohq/storage/secure";

export const RiftApi = {
  async getProxyWallet(args: GetProxyWalletArgs): Promise<GetProxyWalletResponse> {
    const storage = new SecureStorage();
    await storage.setPassword("arbitrary??") // The only diff
    const wallet = await storage.get("wallet");
    if (wallet) {
      return { address: JSON.parse(wallet).address };
    }

    return { address: "fake" };
  },
};
