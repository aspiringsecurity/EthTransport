import SwitchNetwork from '@components/Shared/SwitchNetwork';
import useIsMounted from '@components/utils/hooks/useIsMounted';
import { KeyIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import { Mixpanel } from '@lib/mixpanel';
import onError from '@lib/onError';
import { t, Trans } from '@lingui/macro';
import clsx from 'clsx';
import Errors from 'data/errors';
import { useAuthenticateMutation, useChallengeLazyQuery, useUserProfilesLazyQuery } from 'lens';
import getWalletDetails from 'lib/getWalletDetails';
import type { Dispatch, FC } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CHAIN_ID } from 'src/constants';
import { useAppPersistStore, useAppStore } from 'src/store/app';
import { useAuthStore } from 'src/store/auth';
import { AUTH } from 'src/tracking';
import { Button, Spinner } from 'ui';
import type { Connector } from 'wagmi';
import { useAccount, useConnect, useDisconnect, useNetwork, useSignMessage } from 'wagmi';

interface WalletSelectorProps {
  setHasConnected: Dispatch<boolean>;
  setHasProfile: Dispatch<boolean>;
}

const WalletSelector: FC<WalletSelectorProps> = ({ setHasConnected, setHasProfile }) => {
  const setProfiles = useAppStore((state) => state.setProfiles);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);
  const setShowAuthModal = useAuthStore((state) => state.setShowAuthModal);
  const [loading, setLoading] = useState(false);

  const { mounted } = useIsMounted();
  const { chain } = useNetwork();
  const { connectors, error, connectAsync } = useConnect({ chainId: CHAIN_ID });
  const { disconnect } = useDisconnect();
  const { address, connector: activeConnector } = useAccount();
  const { signMessageAsync } = useSignMessage({ onError });
  const [loadChallenge, { error: errorChallenge }] = useChallengeLazyQuery({
    fetchPolicy: 'no-cache'
  });
  const [authenticate, { error: errorAuthenticate }] = useAuthenticateMutation();
  const [getProfiles, { error: errorProfiles }] = useUserProfilesLazyQuery();

  const onConnect = async (connector: Connector) => {
    try {
      const account = await connectAsync({ connector });
      if (account) {
        setHasConnected(true);
      }
      Mixpanel.track(AUTH.CONNECT_WALLET, {
        wallet: connector.name.toLowerCase()
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSign = async () => {
    let keepModal = false;
    try {
      setLoading(true);
      // Get challenge
      const challenge = await loadChallenge({
        variables: { request: { address } }
      });

      if (!challenge?.data?.challenge?.text) {
        return toast.error(Errors.SomethingWentWrong);
      }

      // Get signature
      const signature = await signMessageAsync({
        message: challenge?.data?.challenge?.text
      });

      // Auth user and set cookies
      const auth = await authenticate({
        variables: { request: { address, signature } }
      });
      localStorage.setItem('accessToken', auth.data?.authenticate.accessToken);
      localStorage.setItem('refreshToken', auth.data?.authenticate.refreshToken);

      // Get authed profiles
      const { data: profilesData } = await getProfiles({
        variables: { ownedBy: address }
      });

      if (!profilesData?.profiles?.items?.length) {
        setHasProfile(false);
        keepModal = true;
      } else {
        const profiles: any = profilesData?.profiles?.items
          ?.slice()
          ?.sort((a, b) => Number(a.id) - Number(b.id))
          ?.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
        const currentProfile = profiles[0];
        setProfiles(profiles);
        setCurrentProfile(currentProfile);
        setProfileId(currentProfile.id);
      }
      Mixpanel.track(AUTH.SIWL);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      if (!keepModal) {
        setShowAuthModal(false);
      }
    }
  };

  return activeConnector?.id ? (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {chain?.id === CHAIN_ID ? (
          <Button
            disabled={loading}
            className="rounded-full"
            icon={loading && <Spinner className="mr-0.5" size="xs" />}
            onClick={handleSign}
          >
            <Trans>Sign-In with Lens</Trans>
          </Button>
        ) : (
          <SwitchNetwork />
        )}
        <button
          onClick={() => {
            disconnect?.();
            Mixpanel.track(AUTH.CHANGE_WALLET);
          }}
          className="flex items-center space-x-1 text-sm text-gray-300 underline hover:text-brand-500"
        >
          <KeyIcon className="h-4 w-4" />
          <div>
            <Trans>Change wallet</Trans>
          </div>
        </button>
      </div>
      {(errorChallenge || errorAuthenticate || errorProfiles) && (
        <div className="flex items-center space-x-1 font-bold text-red-500">
          <XCircleIcon className="h-5 w-5" />
          <div>{Errors.SomethingWentWrong}</div>
        </div>
      )}
    </div>
  ) : (
    <div className="inline-block w-full transform space-y-3 overflow-hidden text-left align-middle transition-all">
      {connectors.map((connector) => {
        return (
          <button
            type="button"
            key={connector.id}
            className={clsx(
              { 'hover:bg-brand-500': connector.id !== activeConnector?.id },
              'flex w-full dark:text-darker hitems-center justify-between overflow-hidden rounded-full bg-white px-3 py-2 outline-none'
            )}
            onClick={() => onConnect(connector)}
            disabled={mounted ? !connector.ready || connector.id === activeConnector?.id : false}
          >
            <span>
              {mounted
                ? connector.id === 'injected'
                  ? 'MetaMask'
                  : getWalletDetails(connector.name).name
                : getWalletDetails(connector.name).name}
              {mounted ? !connector.ready && ' (unsupported)' : ''}
            </span>
            <img
              src={getWalletDetails(connector.name).logo}
              draggable={false}
              className="h-6 w-6"
              height={24}
              width={24}
              alt={connector.id}
            />
          </button>
        );
      })}
      {error?.message ? (
        <div className="flex items-center space-x-1 text-red-500">
          <XCircleIcon className="h-5 w-5" />
          <div>{error?.message ?? t`Failed to connect`}</div>
        </div>
      ) : null}
    </div>
  );
};

export default WalletSelector;
