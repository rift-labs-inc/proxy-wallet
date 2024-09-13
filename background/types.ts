export interface UTXOStatus {
  confirmed: boolean
  block_height: number
  block_hash: string
  block_time: number
}

export interface UTXO {
  txid: string
  vout: number
  status: UTXOStatus
  value: number
}

export interface Fees {
  fastestFee: number
  halfHourFee: number
  hourFee: number
  economyFee: number
  minimumFee: number
}

export interface GetProxyWalletArgs {
  orderNonceHex: string
}
export interface GetProxyWalletResponse {
  address: string
}

export interface LiquidityProvider {
  amount: string
  btcExchangeRate: string
  lockingScriptHex: string
}

export interface GetRiftSwapFeesArgs {
  lps: number 
}

export interface RiftSwapFees {
  virtualSize: number
  feeRateQuote: Fees
  fastFeeAmount: number
  standardFeeAmount: number
  fastTotalAmount: number
  standardTotalAmount: number
}

export interface CreateRiftSwapArgs {
  orderNonceHex: string
  liquidityProviders: Array<LiquidityProvider>
}

export interface GetRiftSwapStatusArgs {
  internalId: string
}
// enum
export enum SwapStatus {
  WAITING_FOR_FUNDING_TRANSACTION = 0,
  PAYMENT_TRANSACTION_SENT = 1,
  IN_MEMPOOL = 2
}

export interface ProxyWalletStatus {
  status: SwapStatus
  paymentTxid: string
  internalId: string
}
