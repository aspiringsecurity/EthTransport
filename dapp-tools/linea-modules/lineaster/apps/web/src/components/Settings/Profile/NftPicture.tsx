import { PencilIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import onError from '@lib/onError';
import splitSignature from '@lib/splitSignature';
import { t, Trans } from '@lingui/macro';
import { LensHub } from 'abis';
import { ADDRESS_REGEX, IS_MAINNET, LENSHUB_PROXY } from 'data/constants';
import Errors from 'data/errors';
import type { NftImage, Profile, UpdateProfileImageRequest } from 'lens';
import {
  useBroadcastMutation,
  useCreateSetProfileImageUriTypedDataMutation,
  useCreateSetProfileImageUriViaDispatcherMutation,
  useNftChallengeLazyQuery
} from 'lens';
import getSignature from 'lib/getSignature';
import type { FC } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { SETTINGS } from 'src/tracking';
import { Button, ErrorMessage, Form, Input, Spinner, useZodForm } from 'ui';
import { useContractWrite, useSignMessage, useSignTypedData } from 'wagmi';
import { mainnet, polygon, polygonMumbai } from 'wagmi/chains';
import { object, string } from 'zod';

const editNftPictureSchema = object({
  contractAddress: string()
    .max(42, { message: t`Contract address should be within 42 characters` })
    .regex(ADDRESS_REGEX, { message: t`Invalid Contract address` }),
  tokenId: string()
});

interface NftPictureProps {
  profile: Profile & { picture: NftImage };
}

const NftPicture: FC<NftPictureProps> = ({ profile }) => {
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [chainId, setChainId] = useState<number>(profile?.picture?.chainId || mainnet.id);
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({ onError });
  const { signMessageAsync } = useSignMessage();

  const onCompleted = () => {
    toast.success(t`Avatar updated successfully!`);
    Mixpanel.track(SETTINGS.PROFILE.SET_NFT_PICTURE);
  };

  const form = useZodForm({
    schema: editNftPictureSchema,
    defaultValues: {
      contractAddress: profile?.picture?.contractAddress,
      tokenId: profile?.picture?.tokenId
    }
  });

  const {
    isLoading: writeLoading,
    error,
    write
  } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: 'setProfileImageURIWithSig',
    mode: 'recklesslyUnprepared',
    onSuccess: onCompleted,
    onError
  });

  const [loadChallenge, { loading: challengeLoading }] = useNftChallengeLazyQuery();
  const [broadcast, { loading: broadcastLoading }] = useBroadcastMutation({
    onCompleted
  });
  const [createSetProfileImageURITypedData, { loading: typedDataLoading }] =
    useCreateSetProfileImageUriTypedDataMutation({
      onCompleted: async ({ createSetProfileImageURITypedData }) => {
        const { id, typedData } = createSetProfileImageURITypedData;
        const { profileId, imageURI, deadline } = typedData.value;
        const signature = await signTypedDataAsync(getSignature(typedData));
        const { v, r, s } = splitSignature(signature);
        const sig = { v, r, s, deadline };
        const inputStruct = {
          profileId,
          imageURI,
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

  const [createSetProfileImageURIViaDispatcher, { loading: dispatcherLoading }] =
    useCreateSetProfileImageUriViaDispatcherMutation({ onCompleted, onError });

  const createViaDispatcher = async (request: UpdateProfileImageRequest) => {
    const { data } = await createSetProfileImageURIViaDispatcher({
      variables: { request }
    });
    if (data?.createSetProfileImageURIViaDispatcher?.__typename === 'RelayError') {
      await createSetProfileImageURITypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request
        }
      });
    }
  };

  const setAvatar = async (contractAddress: string, tokenId: string) => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      const challengeRes = await loadChallenge({
        variables: {
          request: {
            ethereumAddress: currentProfile?.ownedBy,
            nfts: [
              {
                contractAddress,
                tokenId,
                chainId
              }
            ]
          }
        }
      });

      const signature = await signMessageAsync({
        message: challengeRes?.data?.nftOwnershipChallenge?.text as string
      });

      const request: UpdateProfileImageRequest = {
        profileId: currentProfile?.id,
        nftData: {
          id: challengeRes?.data?.nftOwnershipChallenge?.id,
          signature
        }
      };

      if (currentProfile?.dispatcher?.canUseRelay) {
        return await createViaDispatcher(request);
      }

      return await createSetProfileImageURITypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request
        }
      });
    } catch {}
  };

  const isLoading =
    challengeLoading ||
    typedDataLoading ||
    dispatcherLoading ||
    signLoading ||
    writeLoading ||
    broadcastLoading;

  return (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={({ contractAddress, tokenId }) => {
        setAvatar(contractAddress, tokenId);
      }}
    >
      {error && <ErrorMessage className="mb-3" title={t`Transaction failed!`} error={error} />}
      <div>
        <div className="label">Chain</div>
        <div>
          <select
            className="focus:border-brand-500 focus:ring-brand-400 w-full rounded-xl border border-gray-300 bg-white outline-none disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800"
            onChange={(e) => setChainId(parseInt(e.target.value))}
            value={chainId}
          >
            {IS_MAINNET && <option value={mainnet.id}>Ethereum</option>}
            <option value={IS_MAINNET ? polygon.id : polygonMumbai.id}>
              {IS_MAINNET ? 'Polygon' : 'Mumbai'}
            </option>
          </select>
        </div>
      </div>
      <Input
        label={t`Contract Address`}
        type="text"
        placeholder="0x277f5959e22f94d5bd4c2cc0a77c4c71f31da3ac"
        {...form.register('contractAddress')}
      />
      <Input label={t`Token Id`} type="text" placeholder="1" {...form.register('tokenId')} />
      <Button
        className="ml-auto"
        type="submit"
        disabled={isLoading}
        icon={isLoading ? <Spinner size="xs" /> : <PencilIcon className="h-4 w-4" />}
      >
        <Trans>Save</Trans>
      </Button>
    </Form>
  );
};

export default NftPicture;
