import GlobalAlerts from '@components/Shared/GlobalAlerts';
import BottomNavigation from '@components/Shared/Navbar/BottomNavigation';
import getIsAuthTokensAvailable from '@lib/getIsAuthTokensAvailable';
import getToastOptions from '@lib/getToastOptions';
import resetAuthData from '@lib/resetAuthData';
import { IS_MAINNET, MIXPANEL_ENABLED, MIXPANEL_TOKEN } from 'data/constants';
import type { Profile } from 'lens';
import { useUserProfilesQuery } from 'lens';
import mixpanel from 'mixpanel-browser';
import Head from 'next/head';
import { useTheme } from 'next-themes';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { CHAIN_ID } from 'src/constants';
import { useAppPersistStore, useAppStore } from 'src/store/app';
import { useAccount, useDisconnect, useNetwork } from 'wagmi';

import GlobalModals from '../Shared/GlobalModals';
import Loading from '../Shared/Loading';
import Navbar from '../Shared/Navbar';
import useIsMounted from '../utils/hooks/useIsMounted';
import { useDisconnectXmtp } from '../utils/hooks/useXmtpClient';

if (MIXPANEL_ENABLED) {
  mixpanel.init(MIXPANEL_TOKEN, {
    ignore_dnt: true,
    api_host: '/collect',
    batch_requests: false
  });
}

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  const setProfiles = useAppStore((state) => state.setProfiles);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const setIsPro = useAppStore((state) => state.setIsPro);
  const profileId = useAppPersistStore((state) => state.profileId);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);

  const { mounted } = useIsMounted();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const disconnectXmtp = useDisconnectXmtp();

  const resetAuthState = () => {
    setProfileId(null);
    setCurrentProfile(null);
  };

  // Fetch current profiles and sig nonce owned by the wallet address
  const { loading } = useUserProfilesQuery({
    variables: { ownedBy: address },
    skip: !profileId,
    onCompleted: (data) => {
      const profiles = data?.profiles?.items
        ?.slice()
        ?.sort((a, b) => Number(a.id) - Number(b.id))
        ?.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));

      if (!profiles.length) {
        return resetAuthState();
      }

      const selectedUser = profiles.find((profile) => profile.id === profileId);
      setProfiles(profiles as Profile[]);
      setCurrentProfile(selectedUser as Profile);
      setProfileId(selectedUser?.id);
      setUserSigNonce(data?.userSigNonces?.lensHubOnChainSigNonce);
    },
    onError: () => {
      setProfileId(null);
    }
  });

  const validateAuthentication = () => {
    const currentProfileAddress = currentProfile?.ownedBy;
    const isSwitchedAccount = currentProfileAddress !== undefined && currentProfileAddress !== address;
    const isWrongNetworkChain = chain?.id !== CHAIN_ID;
    const shouldLogout = !getIsAuthTokensAvailable() || isWrongNetworkChain || isSwitchedAccount;

    // If there are no auth data, clear and logout
    if (shouldLogout && profileId) {
      disconnectXmtp();
      resetAuthState();
      resetAuthData();
      disconnect?.();
    }
  };

  useEffect(() => {
    validateAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain, disconnect, profileId]);

  // set pro status
  useEffect(() => {
    if (currentProfile?.id && currentProfile?.id === '0x0d') {
      if (IS_MAINNET) {
        setIsPro(true);
      } else {
        setIsPro(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile?.id]);

  // Mixpanel identify
  useEffect(() => {
    if (MIXPANEL_ENABLED && currentProfile?.id) {
      mixpanel.identify(currentProfile?.id);
      mixpanel.people.set({
        $name: currentProfile?.handle,
        $last_active: new Date()
      });
      mixpanel.people.set_once({
        $created_at: new Date()
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile?.id]);

  if (loading || !mounted) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <meta name="theme-color" content={resolvedTheme === 'dark' ? '#1b1b1d' : '#ffffff'} />
      </Head>
      <Toaster position="bottom-right" toastOptions={getToastOptions(resolvedTheme)} />
      <GlobalModals />
      <GlobalAlerts />
      <div className="flex min-h-screen flex-col pb-14 md:pb-0">
        <Navbar />
        <BottomNavigation />
        {children}
      </div>
    </>
  );
};

export default Layout;
