import * as bitcoin from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');


interface LiquidityProvider {
    amount: string;
    btcExchangeRate: string;
    lockingScriptHex: string;
}

interface BitcoinWallet {
    unlockScript: string;
    publicKey: string;
    sign(hash: Buffer): Buffer;
}

const COIN = 100000000; // Satoshis in 1 BTC

function normalizeHexStr(hex: string): string {
    return hex.startsWith('0x') ? hex.slice(2) : hex;
}

function weiToSatoshi(weiAmount: string, weiSatsExchangeRate: string): number {
    return new BigNumber(weiAmount).div(weiSatsExchangeRate).integerValue().toNumber();
}

function satsToWei(satsAmount: number, weiSatsExchangeRate: string): string {
    return new BigNumber(satsAmount).times(weiSatsExchangeRate).toString();
}

async function fetchTransactionDataInBlock(blockHash: string, txid: string, rpcUrl: string): Promise<any> {
    // Implement RPC call to fetch transaction data
    // This is a placeholder and needs to be implemented based on your RPC setup
    throw new Error('Not implemented');
}

export function generateP2WPKH() {
    const network = bitcoin.networks.bitcoin;
    const keyPair = ec.genKeyPair();
    const publicKey = Buffer.from(keyPair.getPublic().encode('array', true));
    const privateKey = keyPair.getPrivate('hex');
    const { address } = bitcoin.payments.p2wpkh({ pubkey: publicKey, network });
    return { address, privateKey };
}

// P2WPKH signing in bitcoinjs-lib
// https://github.com/bitcoinjs/bitcoinjs-lib/issues/999#issuecomment-361124950
async function buildRiftPaymentTransaction(
    orderNonceHex: string,
    liquidityProviders: LiquidityProvider[],
    inTxBlockHashHex: string,
    inTxidHex: string,
    inTxvout: number,
    wallet: BitcoinWallet,
    rpcUrl: string,
    feeSats: number = 50000,
    mainnet: boolean = true
): Promise<{ txidData: string; txid: string; tx: string }> {
    const network = mainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

    const transaction = await fetchTransactionDataInBlock(
        normalizeHexStr(inTxBlockHashHex),
        normalizeHexStr(inTxidHex),
        rpcUrl
    );

    const totalLpSumBtc = liquidityProviders.reduce((sum, lp) => 
        sum + weiToSatoshi(lp.amount, lp.btcExchangeRate), 0);
    const vinSats = Math.floor(parseFloat(transaction.vout[inTxvout].value) * COIN);

    console.log("Total LP Sum BTC", totalLpSumBtc);
    console.log("Vin sats", vinSats);

    const lpOutputs = liquidityProviders.map(lp => {
        return {
            value: weiToSatoshi(lp.amount, lp.btcExchangeRate),
            script: Buffer.from(normalizeHexStr(lp.lockingScriptHex), 'hex')
        };
    });

    if ((vinSats - totalLpSumBtc - feeSats) < 0) {
        throw new Error('Insufficient funds');
    }

    const changeOutput = {
        value: vinSats - totalLpSumBtc - feeSats,
        script: Buffer.from(wallet.unlockScript, 'hex')
    };

    const inscription = {
        value: 0,
        script: Buffer.concat([
            Buffer.from('6a20', 'hex'),
            Buffer.from(normalizeHexStr(orderNonceHex), 'hex')
        ])
    };

    const psbt = new bitcoin.Psbt({ network });
    psbt.addInput({
        hash: normalizeHexStr(inTxidHex),
        index: inTxvout,
        sequence: 0xFFFFFFFD,
        witnessUtxo: {
            script: bitcoin.payments.p2wpkh({ pubkey: Buffer.from(wallet.publicKey, 'hex'), network }).output!,
            value: vinSats
        }
    });

    [...lpOutputs, inscription, changeOutput].forEach(output => {
        psbt.addOutput(output);
    });

    psbt.signInput(0, {
        publicKey: Buffer.from(wallet.publicKey, 'hex'),
        sign: (hash: Buffer) => wallet.sign(hash)
    });

    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    const txidData = tx.toBuffer().toString('hex');
    const txid = tx.getId();
    const txHex = tx.toHex();

    return {
        txidData,
        txid,
        tx: txHex
    };
}

export { buildRiftPaymentTransaction, weiToSatoshi, satsToWei, LiquidityProvider, BitcoinWallet };
