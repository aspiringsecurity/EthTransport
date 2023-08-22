import { Trans } from '@lingui/macro';
import clsx from 'clsx';
import type { Profile } from 'lens';
import { useMutualFollowersQuery } from 'lens';
import formatHandle from 'lib/formatHandle';
import getAvatar from 'lib/getAvatar';
import type { Dispatch, FC, ReactNode } from 'react';
import { useAppStore } from 'src/store/app';
import { Image } from 'ui';

interface MutualFollowersProps {
  setShowMutualFollowersModal?: Dispatch<boolean>;
  profile: Profile;
  variant?: 'xs' | 'sm';
}

const MutualFollowers: FC<MutualFollowersProps> = ({
  setShowMutualFollowersModal,
  profile,
  variant = 'sm'
}) => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  const { data, loading, error } = useMutualFollowersQuery({
    variables: {
      request: {
        viewingProfileId: profile?.id,
        yourProfileId: currentProfile?.id,
        limit: 3
      }
    },
    skip: !profile?.id || !currentProfile?.id
  });

  const profiles = data?.mutualFollowersProfiles?.items ?? [];
  const totalCount = data?.mutualFollowersProfiles?.pageInfo?.totalCount ?? 0;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <div
      className={clsx('lt-text-gray-500 flex cursor-pointer items-center space-x-2.5', {
        'text-sm': variant === 'sm',
        'text-xs': variant === 'xs'
      })}
      onClick={() => setShowMutualFollowersModal?.(true)}
    >
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
      <div>
        <span>
          <Trans>Followed by</Trans>{' '}
        </span>
        {children}
      </div>
    </div>
  );

  if (totalCount === 0 || loading || error) {
    return null;
  }

  const profileOne = profiles[0];
  const profileTwo = profiles[1];
  const profileThree = profiles[2];

  if (profiles?.length === 1) {
    return (
      <Wrapper>
        <span>{profileOne?.name ?? formatHandle(profileOne?.handle)}</span>
      </Wrapper>
    );
  }

  if (profiles?.length === 2) {
    return (
      <Wrapper>
        <span>{profileOne?.name ?? formatHandle(profileOne?.handle)} and </span>
        <span>{profileTwo?.name ?? formatHandle(profileTwo?.handle)}</span>
      </Wrapper>
    );
  }

  if (profiles?.length === 3) {
    const calculatedCount = totalCount - 3;
    const isZero = calculatedCount === 0;

    return (
      <Wrapper>
        <span>{profileOne?.name ?? formatHandle(profileOne?.handle)}, </span>
        <span>
          {profileTwo?.name ?? formatHandle(profileTwo?.handle)}
          {isZero ? ' and ' : ', '}
        </span>
        <span>{profileThree?.name ?? formatHandle(profileThree?.handle)} </span>
        {!isZero && (
          <span>
            and {calculatedCount} {calculatedCount === 1 ? 'other' : 'others'}
          </span>
        )}
      </Wrapper>
    );
  }

  return null;
};

export default MutualFollowers;
