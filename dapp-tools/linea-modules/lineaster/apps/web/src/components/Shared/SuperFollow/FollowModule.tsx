import AllowanceButton from '@components/Settings/Allowance/Button';
import { StarIcon, UserIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import onError from '@lib/onError';
import splitSignature from '@lib/splitSignature';
import { t, Trans } from '@lingui/macro';
import { LensHub } from 'abis';
import { LENSHUB_PROXY, LINEA_EXPLORER_URL } from 'data/constants';
import Errors from 'data/errors';
import type { ApprovedAllowanceAmount, Profile } from 'lens';
import {
  FollowModules,
  useApprovedModuleAllowanceAmountQuery,
  useBroadcastMutation,
  useCreateFollowTypedDataMutation,
  useSuperFollowQuery
} from 'lens';
import formatAddress from 'lib/formatAddress';
import formatHandle from 'lib/formatHandle';
import getSignature from 'lib/getSignature';
import getTokenImage from 'lib/getTokenImage';
import type { Dispatch, FC } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { PROFILE } from 'src/tracking';
import { Button, Spinner, WarningMessage } from 'ui';
import { useAccount, useBalance, useContractWrite, useSignTypedData } from 'wagmi';

import Loader from '../Loader';
import Slug from '../Slug';
import Uniswap from '../Uniswap';

interface FollowModuleProps {
  profile: Profile;
  setFollowing: Dispatch<boolean>;
  setShowFollowModal: Dispatch<boolean>;
  again: boolean;
}

const FollowModule: FC<FollowModuleProps> = ({ profile, setFollowing, setShowFollowModal, again }) => {
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [allowed, setAllowed] = useState(true);
  const { address } = useAccount();
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({ onError });

  const onCompleted = () => {
    setFollowing(true);
    setShowFollowModal(false);
    toast.success(t`Followed successfully!`);
    Mixpanel.track(PROFILE.SUPER_FOLLOW);
  };

  const { isLoading: writeLoading, write } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: 'followWithSig',
    mode: 'recklesslyUnprepared',
    onSuccess: onCompleted,
    onError
  });

  const { data, loading } = useSuperFollowQuery({
    variables: { request: { profileId: profile?.id } },
    skip: !profile?.id
  });

  const followModule: any = data?.profile?.followModule;

  const { data: allowanceData, loading: allowanceLoading } = useApprovedModuleAllowanceAmountQuery({
    variables: {
      request: {
        currencies: followModule?.amount?.asset?.address,
        followModules: [FollowModules.FeeFollowModule],
        collectModules: [],
        referenceModules: []
      }
    },
    skip: !followModule?.amount?.asset?.address || !currentProfile,
    onCompleted: ({ approvedModuleAllowanceAmount }) => {
      setAllowed(approvedModuleAllowanceAmount[0]?.allowance !== '0x00');
    }
  });

  const { data: balanceData } = useBalance({
    address: currentProfile?.ownedBy,
    token: followModule?.amount?.asset?.address,
    formatUnits: followModule?.amount?.asset?.decimals,
    watch: true
  });
  let hasAmount = false;

  if (balanceData && parseFloat(balanceData?.formatted) < parseFloat(followModule?.amount?.value)) {
    hasAmount = false;
  } else {
    hasAmount = true;
  }

  const [broadcast, { loading: broadcastLoading }] = useBroadcastMutation({
    onCompleted
  });
  const [createFollowTypedData, { loading: typedDataLoading }] = useCreateFollowTypedDataMutation({
    onCompleted: async ({ createFollowTypedData }) => {
      const { id, typedData } = createFollowTypedData;
      const { profileIds, datas: followData, deadline } = typedData.value;
      const signature = await signTypedDataAsync(getSignature(typedData));
      const { v, r, s } = splitSignature(signature);
      const sig = { v, r, s, deadline };
      const inputStruct = {
        follower: address,
        profileIds,
        datas: followData,
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

  const createFollow = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      await createFollowTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: {
            follow: [
              {
                profile: profile?.id,
                followModule: {
                  feeFollowModule: {
                    amount: {
                      currency: followModule?.amount?.asset?.address,
                      value: followModule?.amount?.value
                    }
                  }
                }
              }
            ]
          }
        }
      });
    } catch {}
  };

  if (loading) {
    return <Loader message={t`Loading super follow`} />;
  }

  return (
    <div className="p-5">
      <div className="space-y-1.5 pb-2">
        <div className="text-lg font-bold">
          Super follow <Slug slug={formatHandle(profile?.handle)} prefix="@" /> {again ? 'again' : ''}
        </div>
        <div className="lt-text-gray-500">Follow {again ? 'again' : ''} and get some awesome perks!</div>
      </div>
      <div className="flex items-center space-x-1.5 py-2">
        <img
          className="h-7 w-7"
          height={28}
          width={28}
          src={getTokenImage(followModule?.amount?.asset?.symbol)}
          alt={followModule?.amount?.asset?.symbol}
          title={followModule?.amount?.asset?.name}
        />
        <span className="space-x-1">
          <span className="text-2xl font-bold">{followModule?.amount?.value}</span>
          <span className="text-xs">{followModule?.amount?.asset?.symbol}</span>
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <UserIcon className="lt-text-gray-500 h-4 w-4" />
        <div className="space-x-1.5">
          <span>
            <Trans>Recipient:</Trans>
          </span>
          <a
            href={`${LINEA_EXPLORER_URL}/address/${followModule?.recipient}`}
            target="_blank"
            className="font-bold text-gray-600"
            rel="noreferrer noopener"
          >
            {formatAddress(followModule?.recipient)}
          </a>
        </div>
      </div>
      <div className="space-y-2 pt-5">
        <div className="text-lg font-bold">Perks you get</div>
        <ul className="lt-text-gray-500 space-y-1 text-sm">
          <li className="flex space-x-2 leading-6 tracking-normal">
            <div>•</div>
            <div>
              <Trans>You can comment on @{formatHandle(profile?.handle)}'s publications</Trans>
            </div>
          </li>
          <li className="flex space-x-2 leading-6 tracking-normal">
            <div>•</div>
            <div>
              <Trans>You can collect @{formatHandle(profile?.handle)}'s publications</Trans>
            </div>
          </li>
          <li className="flex space-x-2 leading-6 tracking-normal">
            <div>•</div>
            <div>
              <Trans>You will get super follow badge in @{formatHandle(profile?.handle)}'s profile</Trans>
            </div>
          </li>
          <li className="flex space-x-2 leading-6 tracking-normal">
            <div>•</div>
            <div>
              <Trans>You will have high voting power if you followed multiple times</Trans>
            </div>
          </li>
          <li className="flex space-x-2 leading-6 tracking-normal">
            <div>•</div>
            <div>
              <Trans>More coming soon™</Trans>
            </div>
          </li>
        </ul>
      </div>
      {currentProfile ? (
        allowanceLoading ? (
          <div className="shimmer mt-5 h-[34px] w-28 rounded-lg" />
        ) : allowed ? (
          hasAmount ? (
            <Button
              className="mt-5 !px-3 !py-1.5 text-sm"
              variant="super"
              outline
              onClick={createFollow}
              disabled={typedDataLoading || signLoading || writeLoading || broadcastLoading}
              icon={
                typedDataLoading || signLoading || writeLoading || broadcastLoading ? (
                  <Spinner variant="super" size="xs" />
                ) : (
                  <StarIcon className="h-4 w-4" />
                )
              }
            >
              {again ? t`Super follow again` : t`Super follow now`}
            </Button>
          ) : (
            <WarningMessage className="mt-5" message={<Uniswap module={followModule} />} />
          )
        ) : (
          <div className="mt-5">
            <AllowanceButton
              title={t`Allow follow module`}
              module={allowanceData?.approvedModuleAllowanceAmount[0] as ApprovedAllowanceAmount}
              allowed={allowed}
              setAllowed={setAllowed}
            />
          </div>
        )
      ) : null}
    </div>
  );
};

export default FollowModule;
