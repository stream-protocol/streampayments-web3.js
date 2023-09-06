/* eslint-disable @typescript-eslint/no-var-requires */

const dispatchScriptEvent = (eventType: string, streampayJs?: boolean): void => {
    // StreamPayOnramp depends on StreamPay.js being loaded first
    if (!streampayJs) {
      dispatchScriptEvent('load', true);
    }
  
    const injectedScript = document.querySelector(
      streampayJs
        ? 'script[src="https://js.streampayments.app/v1"]'
        : 'script[src="https://crypto-js.streampayments-app/crypto-onramp-outer.js"]'
    );
  
    if (!injectedScript) {
      throw new Error('could not find StreamPay.js script element');
    }
  
    injectedScript.dispatchEvent(new Event(eventType));
  };
  
  describe('StreamPayOnramp module loader', () => {
    const ONRAMP_SCRIPT_SELECTOR =
      'script[src^="https://crypto-js.streampayments.app/crypto-onramp-outer.js"]';
    const SCRIPT_SELECTOR = 'script[src^="https://js.streampayments.app/v1"]';
  
    afterEach(() => {
      const scripts = Array.from(
        document.querySelectorAll(`${SCRIPT_SELECTOR}, ${ONRAMP_SCRIPT_SELECTOR}`)
      );
  
      for (const script of scripts) {
        if (script.parentElement) {
          script.parentElement.removeChild(script);
        }
      }
  
      delete window.StreamPay;
      delete window.StreamPayOnramp;
  
      jest.resetModules();
    });
  
    it('injects the StreamPay script as a side effect after a tick', () => {
      require('./index');
  
      expect(document.querySelector(SCRIPT_SELECTOR)).toBe(null);
      expect(document.querySelector(ONRAMP_SCRIPT_SELECTOR)).toBe(null);
  
      return Promise.resolve().then(() => {
        expect(document.querySelector(SCRIPT_SELECTOR)).not.toBe(null);
        expect(document.querySelector(ONRAMP_SCRIPT_SELECTOR)).not.toBe(null);
      });
    });
  
    it('does not inject the script when StreamPayOnramp is already loaded', () => {
      require('./index');
  
      window.StreamPay = jest.fn((key) => ({key})) as any;
      window.StreamPayOnramp = jest.fn((key) => ({key})) as any;
  
      return new Promise((resolve) => setTimeout(resolve)).then(() => {
        expect(document.querySelector(SCRIPT_SELECTOR)).toBe(null);
        expect(document.querySelector(ONRAMP_SCRIPT_SELECTOR)).toBe(null);
      });
    });
  
    it('skip injecting StreamPay.js when StreamPay is already loaded', () => {
      require('./index');
  
      window.StreamPay = jest.fn((key) => ({key})) as any;
  
      expect(document.querySelector(SCRIPT_SELECTOR)).toBe(null);
      expect(document.querySelector(ONRAMP_SCRIPT_SELECTOR)).toBe(null);
  
      return new Promise((resolve) => setTimeout(resolve)).then(() => {
        expect(document.querySelector(SCRIPT_SELECTOR)).toBe(null);
        expect(document.querySelector(ONRAMP_SCRIPT_SELECTOR)).not.toBe(null);
      });
    });
  
    it('does not inject a duplicate script when one is already present', () => {
      require('./index');
  
      const script = document.createElement('script');
      script.src = 'https://crypto-js.streampayments.app/crypto-onramp-outer.js';
      document.body.appendChild(script);
  
      return Promise.resolve().then(() => {
        expect(document.querySelectorAll(ONRAMP_SCRIPT_SELECTOR)).toHaveLength(1);
      });
    });
  
    describe.each(['./index', './pure'])(
      'loadStreamPayOnramp (%s.ts)',
      (requirePath) => {
        beforeEach(() => {
          jest.restoreAllMocks();
          jest.spyOn(console, 'warn').mockReturnValue();
        });
  
        it('resolves loadStreamPay with StreamPay object', async () => {
          const {loadStreamPayOnramp} = require(requirePath);
          const streampayOnrampPromise = loadStreamPayOnramp('pk_test_foo');
  
          await new Promise((resolve) => setTimeout(resolve));
          window.StreamPay = jest.fn((key) => ({key})) as any;
          window.StreamPayOnramp = jest.fn((key) => ({key})) as any;
          dispatchScriptEvent('load');
  
          return expect(streampayOnrampPromise).resolves.toEqual({
            key: 'pk_test_foo',
          });
        });
  
        it('rejects when the script fails', async () => {
          const {loadStreamPayOnramp} = require(requirePath);
          const streampayOnrampPromise = loadStreamPayOnramp('pk_test_foo');
  
          await Promise.resolve();
          dispatchScriptEvent('error');
  
          await expect(streampayOnrampPromise).rejects.toEqual(
            new Error('Failed to load StreamPayOnramp')
          );
  
          expect(console.warn).not.toHaveBeenCalled();
        });
  
        it('rejects when the StreamPay.js script fails', async () => {
          const {loadStreamPayOnramp} = require(requirePath);
          const streampayOnrampPromise = loadStreamPayOnramp('pk_test_foo');
  
          await Promise.resolve();
          dispatchScriptEvent('error', true);
  
          await expect(streampayOnrampPromise).rejects.toEqual(
            new Error('Failed to load StreamPay.js')
          );
  
          expect(console.warn).not.toHaveBeenCalled();
        });
  
        it('rejects when StreamPayOnramp is not added to the window for some reason', async () => {
          const {loadStreamPayOnramp} = require(requirePath);
          const streampayOnrampPromise = loadStreamPayOnramp('pk_test_foo');
  
          await Promise.resolve();
          dispatchScriptEvent('load');
  
          return expect(streampayOnrampPromise).rejects.toEqual(
            new Error('StreamPayOnramp not available')
          );
        });
      }
    );
  
    describe('loadStreamPayOnramp (index.ts)', () => {
      it('does not cause unhandled rejects when the script fails', async () => {
        require('./index');
  
        await Promise.resolve();
        dispatchScriptEvent('error');
  
        // Turn the task loop to make sure the internal promise handler has been invoked
        await new Promise((resolve) => setTimeout(resolve, 0));
  
        expect(console.warn).toHaveBeenCalledWith(
          new Error('Failed to load StreamPayOnramp')
        );
      });
    });
  });