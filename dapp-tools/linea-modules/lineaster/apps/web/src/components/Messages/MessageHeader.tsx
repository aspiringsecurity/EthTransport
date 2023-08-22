import Unfollow from '@components/Shared/Unfollow';
import UserProfile from '@components/Shared/UserProfile';
import { ChevronLeftIcon } from '@heroicons/react/outline';
import type { Profile } from 'lens';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { FollowSource, UnfollowSource } from 'src/tracking';

import Follow from '../Shared/Follow';

interface MessageHeaderProps {
  profile?: Profile;
}

const MessageHeader: FC<MessageHeaderProps> = ({ profile }) => {
  const router = useRouter();
  const [following, setFollowing] = useState(true);

  const onBackClick = () => {
    router.push('/messages');
  };

  useEffect(() => {
    setFollowing(profile?.isFollowedByMe ?? false);
  }, [profile?.isFollowedByMe, profile]);

  if (!profile) {
    return null;
  }

  return (
    <div className="divider flex items-center justify-between px-4 py-2">
      <div className="flex items-center">
        <ChevronLeftIcon onClick={onBackClick} className="mr-1 h-6 w-6 cursor-pointer lg:hidden" />
        <UserProfile profile={profile} />
      </div>
      {!following ? (
        <Follow
          showText
          profile={profile}
          setFollowing={setFollowing}
          followSource={FollowSource.DIRECT_MESSAGE_HEADER}
        />
      ) : (
        <Unfollow
          showText
          profile={profile}
          setFollowing={setFollowing}
          unFollowSource={UnfollowSource.DIRECT_MESSAGE_HEADER}
        />
      )}
    </div>
  );
};

export default MessageHeader;
