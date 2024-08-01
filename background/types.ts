export interface GetProxyWalletArgs {

}
export interface GetProxyWalletResponse {
  address: string
}

export interface LiquidityProvider {
  amount: string;
  btcExchangeRate: string;
  lockingScriptHex: string
}

export interface CreateRiftSwapArgs {
  orderNonceHex: string,
  liquidityProviders: Array<LiquidityProvider>
}

export interface GetRiftSwapStatusArgs {
  internalId: string
}
// enum
export enum SwapStatus {
  WAITING_FOR_FUNDING_TRANSACTION = 0,
  PAYMENT_TRANSACTION_SENT = 1
}

export interface ProxyWalletStatus {
  status: SwapStatus;
  paymentTxid: string;
  internalId: string;
}
