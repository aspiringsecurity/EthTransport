import AllowanceButton from '@components/Settings/Allowance/Button';
import CollectWarning from '@components/Shared/CollectWarning';
import Loader from '@components/Shared/Loader';
import Markup from '@components/Shared/Markup';
import Collectors from '@components/Shared/Modal/Collectors';
import ReferralAlert from '@components/Shared/ReferralAlert';
import Uniswap from '@components/Shared/Uniswap';
import {
  CashIcon,
  ClockIcon,
  CollectionIcon,
  PhotographIcon,
  PuzzleIcon,
  UsersIcon
} from '@heroicons/react/outline';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { formatTime } from '@lib/formatTime';
import getCoingeckoPrice from '@lib/getCoingeckoPrice';
import { Mixpanel } from '@lib/mixpanel';
import onError from '@lib/onError';
import splitSignature from '@lib/splitSignature';
import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { LensHub, UpdateOwnableFeeCollectModule } from 'abis';
import { IS_RELAYER_AVAILABLE, LENSHUB_PROXY, LINEA_EXPLORER_URL } from 'data/constants';
import Errors from 'data/errors';
import getEnvConfig from 'data/utils/getEnvConfig';
import dayjs from 'dayjs';
import type { BigNumber } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import type { ApprovedAllowanceAmount, ElectedMirror, Publication } from 'lens';
import {
  CollectModules,
  useApprovedModuleAllowanceAmountQuery,
  useBroadcastMutation,
  useCollectModuleQuery,
  useCreateCollectTypedDataMutation,
  useProxyActionMutation,
  usePublicationRevenueQuery
} from 'lens';
import formatAddress from 'lib/formatAddress';
import formatHandle from 'lib/formatHandle';
import getAssetAddress from 'lib/getAssetAddress';
import getSignature from 'lib/getSignature';
import getTokenImage from 'lib/getTokenImage';
import humanize from 'lib/humanize';
import type { Dispatch, FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { PUBLICATION } from 'src/tracking';
import { Button, Modal, Spinner, Tooltip, WarningMessage } from 'ui';
import { useAccount, useBalance, useContractRead, useContractWrite, useSignTypedData } from 'wagmi';

import Splits from './Splits';

interface CollectModuleProps {
  count: number;
  setCount: Dispatch<number>;
  publication: Publication;
  electedMirror?: ElectedMirror;
}

const CollectModule: FC<CollectModuleProps> = ({ count, setCount, publication, electedMirror }) => {
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [revenue, setRevenue] = useState(0);
  const [hasCollectedByMe, setHasCollectedByMe] = useState(publication?.hasCollectedByMe);
  const [showCollectorsModal, setShowCollectorsModal] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const { address } = useAccount();
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({ onError });

  const { data, loading } = useCollectModuleQuery({
    variables: { request: { publicationId: publication?.id } }
  });

  const collectModule: any = data?.publication?.collectModule;
  const isRevertCollectModule = collectModule?.type === CollectModules.RevertCollectModule;
  const isMultirecipientFeeCollectModule =
    collectModule?.type === CollectModules.MultirecipientFeeCollectModule;
  const isFreeCollectModule = collectModule?.type === CollectModules.FreeCollectModule;
  const endTimestamp = collectModule?.endTimestamp ?? collectModule?.optionalEndTimestamp;
  const collectLimit = collectModule?.collectLimit ?? collectModule?.optionalCollectLimit;

  const onCompleted = () => {
    setRevenue(revenue + parseFloat(collectModule?.amount?.value));
    setCount(count + 1);
    setHasCollectedByMe(true);
    toast.success(t`Collected successfully!`);
    Mixpanel.track(PUBLICATION.COLLECT_MODULE.COLLECT, {
      collect_module: collectModule?.type,
      collect_publication_id: publication?.id,
      ...(!isRevertCollectModule && {
        collect_amount: collectModule?.amount?.value,
        collect_currency: collectModule?.amount?.asset?.symbol,
        collect_limit: collectLimit
      })
    });
  };

  const { isFetching, refetch } = useContractRead({
    address: getEnvConfig().UpdateOwnableFeeCollectModuleAddress,
    abi: UpdateOwnableFeeCollectModule,
    functionName: 'getPublicationData',
    args: [parseInt(publication.profile?.id), parseInt(publication?.id.split('-')[1])],
    enabled: false
  });

  const { isLoading: writeLoading, write } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: 'collectWithSig',
    mode: 'recklesslyUnprepared',
    onSuccess: onCompleted,
    onError
  });

  const percentageCollected = (count / parseInt(collectLimit)) * 100;

  const { data: allowanceData, loading: allowanceLoading } = useApprovedModuleAllowanceAmountQuery({
    variables: {
      request: {
        currencies: collectModule?.amount?.asset?.address,
        followModules: [],
        collectModules: collectModule?.type,
        referenceModules: []
      }
    },
    skip: !collectModule?.amount?.asset?.address || !currentProfile,
    onCompleted: ({ approvedModuleAllowanceAmount }) => {
      setAllowed(approvedModuleAllowanceAmount[0]?.allowance !== '0x00');
    }
  });

  const { data: revenueData, loading: revenueLoading } = usePublicationRevenueQuery({
    variables: {
      request: {
        publicationId: publication.__typename === 'Mirror' ? publication?.mirrorOf?.id : publication?.id
      }
    },
    pollInterval: 5000,
    skip: !publication?.id
  });

  const { data: usdPrice } = useQuery(
    ['coingeckoData'],
    () => getCoingeckoPrice(getAssetAddress(collectModule?.amount?.asset?.symbol)).then((res) => res),
    { enabled: Boolean(collectModule?.amount) }
  );

  useEffect(() => {
    setRevenue(parseFloat((revenueData?.publicationRevenue?.revenue?.total?.value as any) ?? 0));
  }, [revenueData]);

  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address,
    token: collectModule?.amount?.asset?.address,
    formatUnits: collectModule?.amount?.asset?.decimals,
    watch: true
  });

  let hasAmount = !(
    balanceData && parseFloat(balanceData?.formatted) < parseFloat(collectModule?.amount?.value)
  );

  const [broadcast, { loading: broadcastLoading }] = useBroadcastMutation({
    onCompleted
  });
  const [createCollectTypedData, { loading: typedDataLoading }] = useCreateCollectTypedDataMutation({
    onCompleted: async ({ createCollectTypedData }) => {
      const { id, typedData } = createCollectTypedData;
      const { profileId, pubId, data: collectData, deadline } = typedData.value;
      const signature = await signTypedDataAsync(getSignature(typedData));
      const { v, r, s } = splitSignature(signature);
      const sig = { v, r, s, deadline };
      const inputStruct = {
        collector: address,
        profileId,
        pubId,
        data: collectData,
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

  const [createCollectProxyAction, { loading: proxyActionLoading }] = useProxyActionMutation({
    onCompleted,
    onError
  });

  const createViaProxyAction = async (variables: any) => {
    const { data } = await createCollectProxyAction({ variables });
    if (!data?.proxyAction) {
      await createCollectTypedData({
        variables: {
          request: { publicationId: publication?.id },
          options: { overrideSigNonce: userSigNonce }
        }
      });
    }
  };

  const createCollect = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      if (IS_RELAYER_AVAILABLE && isFreeCollectModule && !collectModule?.followerOnly) {
        await createViaProxyAction({
          request: { collect: { freeCollect: { publicationId: publication?.id } } }
        });
      } else if (collectModule?.__typename === 'UnknownCollectModuleSettings') {
        refetch().then(async ({ data }) => {
          if (data) {
            const decodedData: any = data;
            const encodedData = defaultAbiCoder.encode(
              ['address', 'uint256'],
              [decodedData?.[2] as string, decodedData?.[1] as BigNumber]
            );
            await createCollectTypedData({
              variables: {
                options: { overrideSigNonce: userSigNonce },
                request: { publicationId: publication?.id, unknownModuleData: encodedData }
              }
            });
          }
        });
      } else {
        await createCollectTypedData({
          variables: {
            options: { overrideSigNonce: userSigNonce },
            request: { publicationId: electedMirror ? electedMirror.mirrorId : publication?.id }
          }
        });
      }
    } catch {}
  };

  if (loading || revenueLoading) {
    return <Loader message={t`Loading collect`} />;
  }

  const isLimitedCollectAllCollected = collectLimit ? count >= parseInt(collectLimit) : false;
  const isCollectExpired = endTimestamp
    ? new Date(endTimestamp).getTime() / 1000 < new Date().getTime() / 1000
    : false;
  const isLoading =
    typedDataLoading || proxyActionLoading || signLoading || isFetching || writeLoading || broadcastLoading;

  return (
    <>
      {Boolean(collectLimit) && (
        <Tooltip placement="top" content={`${percentageCollected.toFixed(0)}% Collected`}>
          <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700">
            <div className="bg-brand-500 h-2.5" style={{ width: `${percentageCollected}%` }} />
          </div>
        </Tooltip>
      )}
      <div className="p-5">
        {collectModule?.followerOnly && (
          <div className="pb-5">
            <CollectWarning
              handle={formatHandle(publication?.profile?.handle)}
              isSuperFollow={publication?.profile?.followModule?.__typename === 'FeeFollowModuleSettings'}
            />
          </div>
        )}
        <div className="space-y-1.5 pb-2">
          {publication?.metadata?.name && (
            <div className="text-xl font-bold">{publication?.metadata?.name}</div>
          )}
          {publication?.metadata?.content && (
            <Markup className="lt-text-gray-500 line-clamp-2">{publication?.metadata?.content}</Markup>
          )}
          <ReferralAlert
            electedMirror={electedMirror}
            mirror={publication}
            referralFee={collectModule?.referralFee}
          />
        </div>
        {collectModule?.amount && (
          <div className="flex items-center space-x-1.5 py-2">
            <img
              className="h-7 w-7"
              height={28}
              width={28}
              src={getTokenImage(collectModule?.amount?.asset?.symbol)}
              alt={collectModule?.amount?.asset?.symbol}
              title={collectModule?.amount?.asset?.symbol}
            />
            <span className="space-x-1">
              <span className="text-2xl font-bold">{collectModule.amount.value}</span>
              <span className="text-xs">{collectModule?.amount?.asset?.symbol}</span>
              {usdPrice ? (
                <>
                  <span className="lt-text-gray-500 px-0.5">·</span>
                  <span className="lt-text-gray-500 text-xs font-bold">
                    ${(collectModule.amount.value * usdPrice).toFixed(2)}
                  </span>
                </>
              ) : null}
            </span>
          </div>
        )}
        <div className="space-y-1.5">
          <div className="item-center block space-y-1 sm:flex sm:space-x-5">
            <div className="flex items-center space-x-2">
              <UsersIcon className="lt-text-gray-500 h-4 w-4" />
              <button
                className="font-bold"
                type="button"
                onClick={() => setShowCollectorsModal(!showCollectorsModal)}
              >
                <Trans>{humanize(count)} collectors</Trans>
              </button>
              <Modal
                title={t`Collected by`}
                icon={<CollectionIcon className="text-brand h-5 w-5" />}
                show={showCollectorsModal}
                onClose={() => setShowCollectorsModal(false)}
              >
                <Collectors
                  publicationId={
                    publication.__typename === 'Mirror' ? publication?.mirrorOf?.id : publication?.id
                  }
                />
              </Modal>
            </div>
            {collectLimit && (
              <div className="flex items-center space-x-2">
                <PhotographIcon className="lt-text-gray-500 h-4 w-4" />
                <div className="font-bold">
                  <Trans>{parseInt(collectLimit) - count} available</Trans>
                </div>
              </div>
            )}
            {collectModule?.referralFee ? (
              <div className="flex items-center space-x-2">
                <CashIcon className="lt-text-gray-500 h-4 w-4" />
                <div className="font-bold">
                  <Trans>{collectModule.referralFee}% referral fee</Trans>
                </div>
              </div>
            ) : null}
          </div>
          {revenueData?.publicationRevenue && (
            <div className="flex items-center space-x-2">
              <CashIcon className="lt-text-gray-500 h-4 w-4" />
              <div className="flex items-center space-x-1.5">
                <span>
                  <Trans>Revenue:</Trans>
                </span>
                <span className="flex items-center space-x-1">
                  <img
                    src={getTokenImage(collectModule?.amount?.asset?.symbol)}
                    className="h-5 w-5"
                    height={20}
                    width={20}
                    alt={collectModule?.amount?.asset?.symbol}
                    title={collectModule?.amount?.asset?.symbol}
                  />
                  <div className="flex items-baseline space-x-1.5">
                    <div className="font-bold">{revenue}</div>
                    <div className="text-[10px]">{collectModule?.amount?.asset?.symbol}</div>
                    {usdPrice ? (
                      <>
                        <span className="lt-text-gray-500">·</span>
                        <span className="lt-text-gray-500 text-xs font-bold">
                          ${(revenue * usdPrice).toFixed(2)}
                        </span>
                      </>
                    ) : null}
                  </div>
                </span>
              </div>
            </div>
          )}
          {endTimestamp && (
            <div className="flex items-center space-x-2">
              <ClockIcon className="lt-text-gray-500 h-4 w-4" />
              <div className="space-x-1.5">
                <span>
                  <Trans>Sale Ends:</Trans>
                </span>
                <span className="font-bold text-gray-600" title={formatTime(endTimestamp)}>
                  {dayjs(endTimestamp).format('MMMM DD, YYYY')} at {dayjs(endTimestamp).format('hh:mm a')}
                </span>
              </div>
            </div>
          )}
          {data?.publication?.collectNftAddress && (
            <div className="flex items-center space-x-2">
              <PuzzleIcon className="lt-text-gray-500 h-4 w-4" />
              <div className="space-x-1.5">
                <span>
                  <Trans>Token:</Trans>
                </span>
                <a
                  href={`${LINEA_EXPLORER_URL}/token/${data?.publication?.collectNftAddress}`}
                  target="_blank"
                  className="font-bold text-gray-600"
                  rel="noreferrer noopener"
                >
                  {formatAddress(data?.publication?.collectNftAddress)}
                </a>
              </div>
            </div>
          )}
          {isMultirecipientFeeCollectModule && <Splits recipients={collectModule?.recipients} />}
        </div>
        <div className="flex items-center space-x-2">
          {currentProfile && (!hasCollectedByMe || !isFreeCollectModule) ? (
            allowanceLoading || balanceLoading ? (
              <div className="shimmer mt-5 h-[34px] w-28 rounded-lg" />
            ) : allowed ? (
              hasAmount ? (
                !isLimitedCollectAllCollected && !isCollectExpired ? (
                  <Button
                    className="mt-5"
                    onClick={createCollect}
                    disabled={isLoading}
                    icon={isLoading ? <Spinner size="xs" /> : <CollectionIcon className="h-4 w-4" />}
                  >
                    <Trans>Collect now</Trans>
                  </Button>
                ) : null
              ) : (
                <WarningMessage className="mt-5" message={<Uniswap module={collectModule} />} />
              )
            ) : (
              <span className="mt-5">
                <AllowanceButton
                  title="Allow collect module"
                  module={allowanceData?.approvedModuleAllowanceAmount[0] as ApprovedAllowanceAmount}
                  allowed={allowed}
                  setAllowed={setAllowed}
                />
              </span>
            )
          ) : null}
        </div>
        {publication?.hasCollectedByMe && (
          <div className="mt-3 flex items-center space-x-1.5 font-bold text-green-500">
            <CheckCircleIcon className="h-5 w-5" />
            <div>
              <Trans>You already collected this</Trans>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CollectModule;
