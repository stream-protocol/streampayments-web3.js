// Keep these in sync with the backend currencies we support
declare type DestinationCurrency = 'btc' | 'eth' | 'matic' | 'sol' | 'usdc' | 'eurc'| 'strm';
declare type DestinationNetwork = 'bitcoin' | 'ethereum' | 'polygon' | 'solana';

type CreateObjHelper<Keys extends string> = {
  [K in Keys]: {
    [K2 in Keys]?: K2 extends K ? string : never;
  };
};
type CreateObjOneKey<Keys extends string> =
  CreateObjHelper<Keys>[keyof CreateObjHelper<Keys>];

type AmountParamKeys =
  | 'source_amount'
  | 'source_total_amount'
  | 'destination_amount';

type AmountParam = CreateObjOneKey<AmountParamKeys>;

export type StandaloneOnrampOptions = {
  destination_currency?: DestinationCurrency;
  destination_network?: DestinationNetwork;
  supported_destination_currencies?: Array<DestinationCurrency>;
  supported_destination_networks?: Array<DestinationNetwork>;
  amount?: AmountParam;
};

export interface StandaloneOnrampSession {
  /**
   * Returns a URL for the parameters passed into a call to Standalone
   */
  getUrl(): string;
}