import { Client } from '@xmtp/xmtp-js';
import { APP_NAME, APP_VERSION, XMTP_ENV } from 'data/constants';
import { Localstorage } from 'data/storage';
import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from 'src/store/app';
import { useMessageStore } from 'src/store/message';
import { useSigner } from 'wagmi';

const ENCODING = 'binary';

const buildLocalStorageKey = (walletAddress: string) => `xmtp:${XMTP_ENV}:keys:${walletAddress}`;

const loadKeys = (walletAddress: string): Uint8Array | null => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

/**
 * Anyone copying this code will want to be careful about leakage of sensitive keys.
 * Make sure that there are no third party services, such as bug reporting SDKs or ad networks, exporting the contents
 * of your LocalStorage before implementing something like this.
 */
const storeKeys = (walletAddress: string, keys: Uint8Array) => {
  localStorage.setItem(buildLocalStorageKey(walletAddress), Buffer.from(keys).toString(ENCODING));
};

/**
 * This will clear the conversation cache + the private keys
 */
const wipeKeys = (walletAddress: string) => {
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};

const useXmtpClient = (cacheOnly = false) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const client = useMessageStore((state) => state.client);
  const setClient = useMessageStore((state) => state.setClient);
  const [awaitingXmtpAuth, setAwaitingXmtpAuth] = useState<boolean>();
  const { data: signer, isLoading } = useSigner();

  useEffect(() => {
    const initXmtpClient = async () => {
      if (signer && !client && currentProfile) {
        let keys = loadKeys(await signer.getAddress());
        if (!keys) {
          if (cacheOnly) {
            return;
          }
          setAwaitingXmtpAuth(true);
          keys = await Client.getKeys(signer, {
            env: XMTP_ENV,
            appVersion: APP_NAME + '/' + APP_VERSION,
            persistConversations: false,
            skipContactPublishing: true
          });
          storeKeys(await signer.getAddress(), keys);
        }

        const xmtp = await Client.create(null, {
          env: XMTP_ENV,
          appVersion: APP_NAME + '/' + APP_VERSION,
          privateKeyOverride: keys,
          persistConversations: true
        });
        setClient(xmtp);
        setAwaitingXmtpAuth(false);
      } else {
        setAwaitingXmtpAuth(false);
      }
    };
    initXmtpClient();
    if (!signer || !currentProfile) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      setClient(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer, currentProfile]);

  return {
    client: client,
    loading: isLoading || awaitingXmtpAuth
  };
};

export const useDisconnectXmtp = () => {
  const { data: signer } = useSigner();
  const client = useMessageStore((state) => state.client);
  const setClient = useMessageStore((state) => state.setClient);
  const disconnect = useCallback(async () => {
    if (signer) {
      wipeKeys(await signer.getAddress());
    }
    if (client) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      setClient(undefined);
    }
    localStorage.removeItem(Localstorage.MessageStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer, client]);

  return disconnect;
};

export default useXmtpClient;
