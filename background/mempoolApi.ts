import { Fees, UTXO, BalanceResponse } from "./types"

export async function getAddress(address: string, hostname: string): Promise<BalanceResponse> {
  const endpoint = `${hostname}/api/address/${address}`

  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: BalanceResponse = await response.json();
    return data
  } catch (error) {
    console.error("Error fetching balance:", error)
    throw error
  }
}

export async function fetchAddressUTXOs(
  address: string,
  hostname: string
): Promise<UTXO[]> {
  const baseUrl = `${hostname}/api/address`
  const endpoint = `${baseUrl}/${address}/utxo`

  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: UTXO[] = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching UTXOs:", error)
    throw error
  }
}

let cachedFees: Fees | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 10000;

export async function getBtcFeeRates(hostname: string): Promise<Fees> {
  const currentTime = Date.now();
  
  // If we have cached data and it's less than 10 seconds old, return it
  if (cachedFees && (currentTime - lastFetchTime < CACHE_DURATION)) {
    return cachedFees;
  }

  const endpoint = `${hostname}/api/v1/fees/recommended`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Fees = await response.json();
    
    // Update the cache and last fetch time
    cachedFees = data;
    lastFetchTime = currentTime;
    
    return data;
  } catch (error) {
    console.error("Error fetching Fees:", error);
    throw error;
  }
}
export async function fetchSerializedTransactionData(
  txid: string,
  hostname: string
): Promise<string> {
  const endpoint = `${hostname}/api/tx/${txid}/hex`
  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.text()
    return data
  } catch (error) {
    console.error("Error fetching transaction data:", error)
    throw error
  }
}

export async function broadcastTransaction(
  txHex: string,
  hostname: string
): Promise<void> {
  const endpoint = `${hostname}/api/tx`
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: txHex
    })
    if (!response.ok) {
      throw new Error(`HTTP error! response: ${await response.text()}, status: ${response.status}`)
    }
    console.log("Transaction broadcasted successfully")
  } catch (error) {
    console.error("Error broadcasting transaction:", error)
    throw error
  }
}
