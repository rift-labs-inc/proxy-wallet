// BGSW Rift API
import { GetProxyWalletArgs, GetProxyWalletResponse } from "./types";
import { SecureStorage } from "@plasmohq/storage/secure";
import * as bitcoin from 'bitcoinjs-lib';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

function generateP2WPKH() {
    const network = bitcoin.networks.bitcoin;
    const keyPair = ec.genKeyPair();
    const publicKey = Buffer.from(keyPair.getPublic().encode('array', true));
    const privateKey = keyPair.getPrivate('hex');
    const { address } = bitcoin.payments.p2wpkh({ pubkey: publicKey, network });
    return { address, privateKey };
}

export const RiftApi = {
  async getProxyWallet(args: GetProxyWalletArgs): Promise<GetProxyWalletResponse> {
    const storage = new SecureStorage();
    await storage.setPassword("arbitrary??")
    const wallet = await storage.get("wallet");
    if (wallet) {
      return { address: JSON.parse(wallet).address };
    }
    const { address, privateKey } = generateP2WPKH();
    await storage.set("wallet", JSON.stringify({ address, privateKey }));
    return { address };
  },
};
