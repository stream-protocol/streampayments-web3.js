import {loadScript, initStreamPayOnramp, LoadStreamPayOnramp} from './shared';
import {loadStreamPay} from '@stream-pay/streampay-js/pure';

export const loadStreamPayOnramp: LoadStreamPayOnramp = (...args) => {
  const startTime = Date.now();

  return Promise.all([loadStreamPay(...args), loadScript()]).then(
    ([, maybeStreamPayOnramp]) =>
      initStreamPayOnramp(maybeStreanPayOnramp, args, startTime)
  );
};