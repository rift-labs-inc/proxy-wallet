// BGSW Rift API
import { GetProxyWalletArgs, GetProxyWalletResponse } from "./types";
import { SecureStorage } from "@plasmohq/storage/secure";
import { generateP2WPKH } from "./bitcoin";

export const RiftApi = {
  async getProxyWallet(args: GetProxyWalletArgs): Promise<GetProxyWalletResponse> {
    const storage = new SecureStorage();
    // TODO: Does this need to actually be encrypted with something secure?
    await storage.setPassword("rift-exchange")
    const wallet = await storage.get("wallet");
    if (wallet) {
      return { address: JSON.parse(wallet).address };
    }
    const { address, privateKey } = generateP2WPKH();
    await storage.set("wallet", JSON.stringify({ address, privateKey }));
    return { address };
  },
};
