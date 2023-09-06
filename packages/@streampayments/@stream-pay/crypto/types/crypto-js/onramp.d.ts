import {OnrampSession, OnrampSessionOptions} from './onramp-session';
import {
  StandaloneOnrampSession,
  StandaloneOnrampOptions,
} from './standalone-onramp-session';

export interface StreamPayOnramp {
  /**
   * Creates an OnrampSession instance
   *
   * @param options A set of options to create this OnrampSession instance with.
   * @param options.clientSecret The client secret for an OnrampSession.
   * @param options.appearance.theme The 'light' or 'dark' theme to apply for an OnrampSession.
   */
  createSession(options: OnrampSessionOptions): OnrampSession;
}

/**
 * Use `StreamPayOnramp(publishableKey)` to create an instance of the `StreamPayOnramp` object.
 * The StreamPayOnramp object is your entrypoint to the rest of the StreamPay Crypto Onramp SDK.
 *
 * Your StreamPay publishable [API key](https://streampayments.app/docs/keys) is required when calling this function, as it identifies your website to StreamPay.
 *
 * When you’re ready to accept live payments, replace the test key with your live key in production.
 * Learn more about how API keys work in [test mode and live mode](https://streampayments.app/docs/dashboard#viewing-test-data).
 */
export interface StreamPayOnrampConstructor {
  (
    /**
     * Your publishable key.
     */
    publishableKey: string
  ): StreamPayOnramp;
  /**
   * Configures a Standalone Onramp session
   * @param options A set of options to create this Standalone instance with.
   * @param options.amount An object representing the amount the Standalone session should be set to. Only one of the possible amount keys should be set in this object.
   * @param options.amount.source_amount Numerical string representing the source amount of the transaction, not including fees.
   * @param options.amount.source_total_amount Numerical string representing the source amount of the transaction, including fees.
   * @param options.amount.destination_amount Numerical string representing the destination amount of the transaction.
   * @param options.destination_currency The destination currency of the transaction. Must be specified along with destination_network.
   * @param options.destination_network The network the transaction will run on. Must be specified along with destination_currency.
   * @param options.supported_destination_currencies Array of allowed destination currencies for the Standalone session.
   * @param options.supported_destination_networks Array of allowed destination networks for the Standalone session.
   */
  Standalone(options: StandaloneOnrampOptions): StandaloneOnrampSession;
}