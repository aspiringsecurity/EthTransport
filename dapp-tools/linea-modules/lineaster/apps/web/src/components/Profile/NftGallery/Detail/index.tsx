import MetaTags from '@components/Common/MetaTags';
import Slug from '@components/Shared/Slug';
import UserProfile from '@components/Shared/UserProfile';
import { Mixpanel } from '@lib/mixpanel';
import { FeatureFlag } from 'data/feature-flags';
import type { Profile } from 'lens';
import formatHandle from 'lib/formatHandle';
import getAvatar from 'lib/getAvatar';
import isFeatureEnabled from 'lib/isFeatureEnabled';
import Link from 'next/link';
import type { FC } from 'react';
import React, { useEffect } from 'react';
import Custom404 from 'src/pages/404';
import { useAppStore } from 'src/store/app';
import { PAGEVIEW } from 'src/tracking';
import { Card, GridItemEight, GridItemFour, GridLayout, Image } from 'ui';

const NFTDetail: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const profiles = useAppStore((state) => state.profiles);

  useEffect(() => {
    Mixpanel.track(PAGEVIEW, { page: 'nft' });
  }, []);

  if (!isFeatureEnabled(FeatureFlag.NftDetail, currentProfile?.id) || !currentProfile) {
    return <Custom404 />;
  }

  return (
    <GridLayout className="pt-6">
      <MetaTags title="Subscape #363" />
      <GridItemEight className="space-y-5">
        <Card className="p-4">
          <img
            width={500}
            height={500}
            className="h-full w-full p-16"
            src="/pride.svg"
            alt="nft"
            draggable={false}
          />
        </Card>
      </GridItemEight>
      <GridItemFour className="space-y-4">
        <Card className="p-4">
          <h1>Subscape #363</h1>
          <Slug className="text-xs" slug="Subscapes" />
          <div className="flex items-center space-x-1 pt-3">
            <div className="contents -space-x-2">
              {profiles?.map((profile) => (
                <Image
                  key={profile.handle}
                  className="h-5 w-5 rounded-full border dark:border-gray-700"
                  onError={({ currentTarget }) => {
                    currentTarget.src = getAvatar(profile, false);
                  }}
                  src={getAvatar(profile)}
                  alt={formatHandle(profile?.handle)}
                />
              ))}
            </div>
            <div className="text-xs">Sasi, Jouni, Yogi, and 10 others own Subscapes</div>
          </div>
        </Card>
        <Card className="p-4">
          <h1 className="mb-2">Description</h1>
          <p className="text-sm opacity-60">
            A generative algorithm that draws the impression of a landscape from a multitude of possibilities.
            The unique seed from each token drives the parametric assortment of lines, colors, and forms into
            a constructed composition.
          </p>
        </Card>
        <Card className="p-4">
          <h1 className="mb-2">Owner</h1>
          <UserProfile profile={currentProfile as Profile} showUserPreview />
        </Card>
        <Card className="divide-y p-4 dark:divide-gray-700">
          <div className="pb-3">
            <div className="text-sm opacity-50">Floor price</div>
            <span>1.2 ETH</span>
          </div>
          <div className="py-3">
            <div className="text-sm opacity-50">Contract address</div>
            <div className="truncate">{currentProfile?.ownedBy}</div>
          </div>
          <div className="pt-3">
            <div className="text-sm opacity-50">Token ID</div>
            <div className="truncate">12</div>
          </div>
        </Card>
        <Card className="p-4">
          <h1 className="mb-2">View on</h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="https://lensport.io"
              className="flex items-center space-x-1 rounded-lg border px-2 py-0.5 dark:border-gray-700"
              target="_blank"
            >
              <img className="h-4 w-4" src="/logo.svg" width={10} height={10} alt="Lensport" />
              <span>Lensport</span>
            </Link>
            <Link
              href="https://opensea.io"
              className="flex items-center space-x-1 rounded-lg border px-2 py-0.5 dark:border-gray-700"
              target="_blank"
            >
              <img className="h-4 w-4" src="/logo.svg" width={10} height={10} alt="Opensea" />
              <span>Opensea</span>
            </Link>
            <Link
              href="https://rarible.com"
              className="flex items-center space-x-1 rounded-lg border px-2 py-0.5 dark:border-gray-700"
              target="_blank"
            >
              <img className="h-4 w-4" src="/logo.svg" width={10} height={10} alt="Rarible" />
              <span>Rarible</span>
            </Link>
            <Link
              href="https://opensea.io"
              className="flex items-center space-x-1 rounded-lg border px-2 py-0.5 dark:border-gray-700"
              target="_blank"
            >
              <img className="h-4 w-4" src="/logo.svg" width={10} height={10} alt="Uniswap" />
              <span>Uniswap</span>
            </Link>
            <Link
              href="https://rarible.com"
              className="flex items-center space-x-1 rounded-lg border px-2 py-0.5 dark:border-gray-700"
              target="_blank"
            >
              <img className="h-4 w-4" src="/logo.svg" width={10} height={10} alt="Looksrare" />
              <span>Looksrare</span>
            </Link>
            <Link
              href="https://etherscan.com"
              className="flex items-center space-x-1 rounded-lg border px-2 py-0.5 dark:border-gray-700"
              target="_blank"
            >
              <img className="h-4 w-4" src="/logo.svg" width={10} height={10} alt="Etherscan" />
              <span>Etherscan</span>
            </Link>
          </div>
        </Card>
      </GridItemFour>
    </GridLayout>
  );
};

export default NFTDetail;
