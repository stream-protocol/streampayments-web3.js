import {StreamPayOnramp, StreamPayOnrampConstructor} from '../types';

export type LoadStreamPayOnramp = (
  ...args: Parameters<StreamPayOnrampConstructor>
) => Promise<StreamPayOnramp | null>;

// `_VERSION` will be rewritten by `@rollup/plugin-replace` as a string literal
// containing the package.json version
declare const _VERSION: string;

const ONRAMP_URL = 'https://crypto-js.streampayments.app/crypto-onramp-outer.js';

export const findScript = (): HTMLScriptElement | null => {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    `script[src^="${ONRAMP_URL}"]`
  );

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];

    if (ONRAMP_URL !== script.src) {
      continue;
    }

    return script;
  }

  return null;
};

const injectScript = (): HTMLScriptElement => {
  const script = document.createElement('script');
  script.src = ONRAMP_URL;

  const headOrBody = document.head || document.body;

  if (!headOrBody) {
    throw new Error(
      'Expected document.body not to be null. StreamPay Crypto requires a <body> element.'
    );
  }

  headOrBody.appendChild(script);

  return script;
};

const registerWrapper = (streampay: any, startTime: number): void => {
  // TODO(forestfang): we do not have a mechanism to track metrics here yet
  if (!streampay || !streampay._registerWrapper) {
    return;
  }

  streampay._registerWrapper({
    name: 'crypto-js',
    version: _VERSION,
    startTime,
  });
};

let streampayPromise: Promise<StreamPayOnrampConstructor | null> | null = null;

export const loadScript = (): Promise<StreamPayOnrampConstructor | null> => {
  // Ensure that we only attempt to load StreamPay.js at most once
  if (streampayPromise !== null) {
    return streampayPromise;
  }

  streampayPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Resolve to null when imported server side. This makes the module
      // safe to import in an isomorphic code base.
      resolve(null);
      return;
    }

    if (window.StreamPayOnramp) {
      resolve(window.StreamPayOnramp);
      return;
    }

    try {
      let script = findScript();

      if (!script) {
        script = injectScript();
      }

      script.addEventListener('load', () => {
        if (window.StreamPayOnramp) {
          resolve(window.StreamPayOnramp);
        } else {
          reject(new Error('StreamPayOnramp not available'));
        }
      });

      script.addEventListener('error', () => {
        reject(new Error('Failed to load StreamPayOnramp'));
      });
    } catch (error) {
      reject(error);
      return;
    }
  });

  return streampayPromise;
};

export const initStreamPayOnramp = (
  maybeStreamPayOnramp: StreamPayOnrampConstructor | null,
  args: Parameters<StreamPayOnrampConstructor>,
  startTime: number
): StreamPayOnramp | null => {
  if (maybeStreamPayOnramp === null) {
    return null;
  }

  const streampayOnramp = maybeStreamPayOnramp.apply(undefined, args);
  registerWrapper(streampayOnramp, startTime);
  return streampayOnramp;
};