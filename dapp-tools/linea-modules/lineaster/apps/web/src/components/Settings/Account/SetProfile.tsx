import UserProfile from '@components/Shared/UserProfile';
import { ExclamationIcon, PencilIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import onError from '@lib/onError';
import splitSignature from '@lib/splitSignature';
import { t, Trans } from '@lingui/macro';
import { LensHub } from 'abis';
import { APP_NAME, LENSHUB_PROXY } from 'data/constants';
import Errors from 'data/errors';
import type { CreateSetDefaultProfileRequest, Profile } from 'lens';
import { useBroadcastMutation, useCreateSetDefaultProfileTypedDataMutation } from 'lens';
import formatHandle from 'lib/formatHandle';
import getSignature from 'lib/getSignature';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Custom404 from 'src/pages/404';
import { useAppStore } from 'src/store/app';
import { SETTINGS } from 'src/tracking';
import { Button, Card, ErrorMessage, Spinner } from 'ui';
import { useAccount, useContractWrite, useSignTypedData } from 'wagmi';

const SetProfile: FC = () => {
  const profiles = useAppStore((state) => state.profiles);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const [selectedUser, setSelectedUser] = useState('');
  const { address } = useAccount();
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({ onError });

  const onCompleted = () => {
    toast.success(t`Default profile updated successfully!`);
    Mixpanel.track(SETTINGS.ACCOUNT.SET_DEFAULT_PROFILE);
  };

  const {
    isLoading: writeLoading,
    error,
    write
  } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: 'setDefaultProfileWithSig',
    mode: 'recklesslyUnprepared',
    onSuccess: onCompleted,
    onError
  });

  const hasDefaultProfile = Boolean(profiles.find((o) => o.isDefault));
  const sortedProfiles: Profile[] = profiles?.sort((a, b) =>
    a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
  );

  useEffect(() => {
    setSelectedUser(sortedProfiles[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [broadcast, { loading: broadcastLoading }] = useBroadcastMutation({
    onCompleted
  });
  const [createSetDefaultProfileTypedData, { loading: typedDataLoading }] =
    useCreateSetDefaultProfileTypedDataMutation({
      onCompleted: async ({ createSetDefaultProfileTypedData }) => {
        const { id, typedData } = createSetDefaultProfileTypedData;
        const { wallet, profileId, deadline } = typedData.value;
        const signature = await signTypedDataAsync(getSignature(typedData));
        const { v, r, s } = splitSignature(signature);
        const sig = { v, r, s, deadline };
        const inputStruct = {
          follower: address,
          wallet,
          profileId,
          sig
        };
        setUserSigNonce(userSigNonce + 1);
        const { data } = await broadcast({ variables: { request: { id, signature } } });
        if (data?.broadcast.__typename === 'RelayError') {
          return write?.({ recklesslySetUnpreparedArgs: [inputStruct] });
        }
      },
      onError
    });

  const setDefaultProfile = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      const request: CreateSetDefaultProfileRequest = { profileId: selectedUser };
      await createSetDefaultProfileTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request
        }
      });
    } catch {}
  };

  if (!currentProfile) {
    return <Custom404 />;
  }

  const isLoading = typedDataLoading || signLoading || writeLoading || broadcastLoading;

  return (
    <Card className="space-y-5 p-5">
      {error && <ErrorMessage title={t`Transaction failed!`} error={error} />}
      {hasDefaultProfile ? (
        <>
          <div className="text-lg font-bold">
            <Trans>Your default profile</Trans>
          </div>
          <UserProfile profile={sortedProfiles[0]} />
        </>
      ) : (
        <div className="flex items-center space-x-1.5 font-bold text-yellow-500">
          <ExclamationIcon className="h-5 w-5" />
          <div>
            <Trans>You don't have any default profile set!</Trans>
          </div>
        </div>
      )}
      <div className="text-lg font-bold">
        <Trans>Select default profile</Trans>
      </div>
      <p>
        <Trans>
          Selecting your default account helps to display the selected profile across {APP_NAME}, you can
          change your default profile anytime.
        </Trans>
      </p>
      <div className="text-lg font-bold">
        <Trans>What else you should know</Trans>
      </div>
      <div className="lt-text-gray-500 divide-y text-sm dark:divide-gray-700">
        <p className="pb-3">
          <Trans>
            Only the default profile will be visible across the {APP_NAME}, example notifications, follow etc.
          </Trans>
        </p>
        <p className="py-3">
          <Trans>You can change default profile anytime here.</Trans>
        </p>
      </div>
      <div>
        <div className="label">
          <Trans>Select profile</Trans>
        </div>
        <select
          className="focus:border-brand-500 focus:ring-brand-400 w-full rounded-xl border border-gray-300 bg-white outline-none disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800"
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          {sortedProfiles?.map((profile: Profile) => (
            <option key={profile?.id} value={profile?.id}>
              @{formatHandle(profile?.handle)}
            </option>
          ))}
        </select>
      </div>
      <Button
        className="ml-auto"
        type="submit"
        disabled={isLoading}
        onClick={setDefaultProfile}
        icon={isLoading ? <Spinner size="xs" /> : <PencilIcon className="h-4 w-4" />}
      >
        <Trans>Save</Trans>
      </Button>
    </Card>
  );
};

export default SetProfile;
