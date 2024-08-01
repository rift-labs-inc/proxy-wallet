interface UTXOStatus {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

interface UTXO {
  txid: string;
  vout: number;
  status: UTXOStatus;
  value: number;
}

export async function fetchAddressUTXOs(address: string, hostname: string): Promise<UTXO[]> {
  const baseUrl = `${hostname}/api/address`;
  const endpoint = `${baseUrl}/${address}/utxo`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: UTXO[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching UTXOs:', error);
    throw error;
  }
}



export async function fetchSerializedTransactionData(txid: string, hostname: string): Promise<string> {
  const endpoint = `${hostname}/api/tx/${txid}/hex`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    throw error;
  }
}

export async function broadcastTransaction(txHex: string, hostname: string): Promise<void> {
  const endpoint = `${hostname}/api/tx`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: txHex
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('Transaction broadcasted successfully');
  } catch (error) {
    console.error('Error broadcasting transaction:', error);
    throw error;
  }
}

