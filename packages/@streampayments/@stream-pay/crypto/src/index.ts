import {loadStreamPay} from '@stream-pay/streampay-js';
import {StreamPayOnrampConstructor} from '../types';
import {StandaloneOnrampOptions} from '../types/crypto-js/standalone-onramp-session';

import {loadScript, initStreamPayOnramp, LoadStreamPayOnramp} from './shared';
import {LoadStandaloneOnrampUrl} from './standalone';

// Execute our own script injection after a tick to give users time to do their
// own script injection.
const streampayOnrampPromise = Promise.resolve().then(() => loadScript());

let loadCalled = false;

streampayOnrampPromise.catch((err: Error) => {
  if (!loadCalled) {
    console.warn(err);
  }
});

export const loadStreamPayOnramp: LoadStreamPayOnramp = (...args) => {
  loadCalled = true;
  const startTime = Date.now();

  return Promise.all([loadStreamPay(...args), streampayOnrampPromise]).then(
    ([, maybeStreamPayOnramp]) =>
      initStreamPayOnramp(maybeStreamPayOnramp, args, startTime)
  );
};

export const getStandaloneOnrampUrl: LoadStandaloneOnrampUrl = (
  options: StandaloneOnrampOptions
) => {
  return streampayOnrampPromise
    .then((streampayOnramp: StreamPayOnrampConstructor | null) => {
      // Resolve to null if promise returns null (happens serverside)
      if (streampayOnramp === null) {
        return null;
      }
      const standaloneOnramp = streampayOnramp.Standalone(options);
      return standaloneOnramp.getUrl();
    })
    .catch(() => {
      // Resolve to null on all errors
      return null;
    });
};