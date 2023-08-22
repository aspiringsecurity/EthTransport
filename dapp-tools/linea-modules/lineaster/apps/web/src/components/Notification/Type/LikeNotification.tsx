import Markup from '@components/Shared/Markup';
import UserPreview from '@components/Shared/UserPreview';
import { SunIcon } from '@heroicons/react/outline';
import { HeartIcon } from '@heroicons/react/solid';
import { formatTime, getTimeFromNow } from '@lib/formatTime';
import { defineMessage } from '@lingui/macro';
import { Trans } from '@lingui/react';
import type { NewReactionNotification } from 'lens';
import hasGm from 'lib/hasGm';
import Link from 'next/link';
import type { FC } from 'react';
import type { MessageDescriptor } from 'src/types';

import { NotificationProfileAvatar, NotificationProfileName } from '../Profile';

const messages: Record<string, MessageDescriptor> = {
  comment: defineMessage({
    id: '<0><1/> liked your <2>comment</2></0>'
  }),
  mirror: defineMessage({
    id: '<0><1/> liked your <2>mirror</2></0>'
  }),
  post: defineMessage({
    id: '<0><1/> liked your <2>post</2></0>'
  })
};

const defaultMessage = (typeName: string): string => {
  return '<0><1/> liked your <2>' + typeName + '</2></0>';
};

interface LikeNotificationProps {
  notification: NewReactionNotification;
}

const LikeNotification: FC<LikeNotificationProps> = ({ notification }) => {
  const typeName = notification?.publication?.__typename?.toLowerCase() || '';
  const isGM = hasGm(notification?.publication?.metadata?.content);

  return (
    <div className="flex items-start justify-between">
      <div className="w-4/5 space-y-2">
        <div className="flex items-center space-x-3">
          {isGM ? (
            <SunIcon className="h-6 w-6 text-yellow-600/70" />
          ) : (
            <HeartIcon className="h-6 w-6 text-pink-500/70" />
          )}
          <UserPreview profile={notification?.profile}>
            <NotificationProfileAvatar profile={notification?.profile} />
          </UserPreview>
        </div>
        <div className="ml-9">
          <Trans
            id={messages[typeName]?.id || defaultMessage(typeName)}
            components={[
              <span className="pl-0.5 text-gray-600 dark:text-gray-400" key="" />,
              <NotificationProfileName profile={notification?.profile} key="" />,
              <Link href={`/posts/${notification?.publication?.id}`} className="font-bold" key="" />
            ]}
          />
          <Link
            href={`/posts/${notification?.publication?.id}`}
            className="lt-text-gray-500 linkify mt-2 line-clamp-2"
          >
            <Markup>{notification?.publication?.metadata?.content}</Markup>
          </Link>
        </div>
      </div>
      <div className="text-[12px] text-gray-400" title={formatTime(notification?.createdAt)}>
        {getTimeFromNow(notification?.createdAt)}
      </div>
    </div>
  );
};

export default LikeNotification;
