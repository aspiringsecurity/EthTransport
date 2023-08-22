import Markup from '@components/Shared/Markup';
import { EmojiSadIcon } from '@heroicons/react/outline';
import { formatTime } from '@lib/formatTime';
import { Trans } from '@lingui/macro';
import type { DecodedMessage } from '@xmtp/xmtp-js';
import clsx from 'clsx';
import dayjs from 'dayjs';
import type { Profile } from 'lens';
import formatHandle from 'lib/formatHandle';
import getAvatar from 'lib/getAvatar';
import type { FC, ReactNode } from 'react';
import { memo } from 'react';
import { useInView } from 'react-cool-inview';
import { Card, Image } from 'ui';

const isOnSameDay = (d1?: Date, d2?: Date): boolean => {
  return dayjs(d1).format('YYYYMMDD') === dayjs(d2).format('YYYYMMDD');
};

const formatDate = (d?: Date) => dayjs(d).format('MMMM D, YYYY');

interface MessageTileProps {
  message: DecodedMessage;
  profile?: Profile;
  currentProfile?: Profile | null;
}

const MessageTile: FC<MessageTileProps> = ({ message, profile, currentProfile }) => {
  const address = currentProfile?.ownedBy;

  return (
    <div
      className={clsx(
        address === message.senderAddress ? 'mr-4 items-end' : 'items-start',
        'mx-auto mb-4 flex flex-col'
      )}
    >
      <div className="flex max-w-[60%]">
        {address !== message.senderAddress && (
          <Image
            onError={({ currentTarget }) => {
              currentTarget.src = getAvatar(profile, false);
            }}
            src={getAvatar(profile)}
            className="mr-2 h-10 w-10 rounded-full border bg-gray-200 dark:border-gray-700"
            alt={formatHandle(profile?.handle)}
          />
        )}
        <div
          className={clsx(
            address === message.senderAddress ? 'bg-brand-500' : 'bg-gray-100 dark:bg-gray-700',
            'w-full rounded-lg px-4 py-2'
          )}
        >
          <span
            className={clsx(
              address === message.senderAddress && 'text-white',
              'text-md linkify-message block break-words'
            )}
          >
            {message.error ? `Error: ${message.error?.message}` : <Markup>{message.content}</Markup> ?? ''}
          </span>
        </div>
      </div>
      <div className={clsx(address !== message.senderAddress ? 'ml-12' : '')}>
        <span className="place-self-end text-xs text-gray-400" title={formatTime(message.sent)}>
          {dayjs(message.sent).fromNow()}
        </span>
      </div>
    </div>
  );
};

interface DateDividerBorderProps {
  children: ReactNode;
}

const DateDividerBorder: FC<DateDividerBorderProps> = ({ children }) => (
  <>
    <div className="h-0.5 grow bg-gray-300/25" />
    {children}
    <div className="h-0.5 grow bg-gray-300/25" />
  </>
);

const DateDivider: FC<{ date?: Date }> = ({ date }) => (
  <div className="align-items-center flex items-center p-4 pl-2 pt-0">
    <DateDividerBorder>
      <span className="mx-11 flex-none text-sm font-bold text-gray-300">{formatDate(date)}</span>
    </DateDividerBorder>
  </div>
);

const MissingXmtpAuth: FC = () => (
  <Card as="aside" className="mb-2 mr-4 space-y-2.5 border-gray-400 !bg-gray-300 !bg-opacity-20 p-5">
    <div className="flex items-center space-x-2 font-bold">
      <EmojiSadIcon className="h-5 w-5" />
      <p>
        <Trans>This fren hasn't enabled DMs yet</Trans>
      </p>
    </div>
    <p className="text-sm leading-[22px]">
      <Trans>You can't send them a message until they enable DMs.</Trans>
    </p>
  </Card>
);

const ConversationBeginningNotice: FC = () => (
  <div className="align-items-center mt-6 flex justify-center pb-4">
    <span className="text-sm font-bold text-gray-300">
      <Trans>This is the beginning of the conversation</Trans>
    </span>
  </div>
);

const LoadingMore: FC = () => (
  <div className="mt-6 p-1 text-center text-sm font-bold text-gray-300">
    <Trans>Loading...</Trans>
  </div>
);

interface MessageListProps {
  messages: DecodedMessage[];
  fetchNextMessages: () => void;
  profile?: Profile;
  currentProfile?: Profile | null;
  hasMore: boolean;
  missingXmtpAuth: boolean;
}

const MessagesList: FC<MessageListProps> = ({
  messages,
  fetchNextMessages,
  profile,
  currentProfile,
  hasMore,
  missingXmtpAuth
}) => {
  let lastMessageDate: Date | undefined;
  const { observe } = useInView({
    onChange: async ({ inView }) => {
      if (!inView) {
        return;
      }

      fetchNextMessages();
    }
  });

  return (
    <div className="flex h-[75%] flex-grow">
      <div className="relative flex h-full w-full pl-4">
        <div className="flex h-full w-full flex-col-reverse overflow-y-auto">
          {missingXmtpAuth && <MissingXmtpAuth />}
          <span className="flex flex-col-reverse overflow-y-auto overflow-x-hidden">
            {messages?.map((msg: DecodedMessage, index) => {
              const dateHasChanged = lastMessageDate ? !isOnSameDay(lastMessageDate, msg.sent) : false;
              const messageDiv = (
                <div key={`${msg.id}_${index}`} ref={index === messages.length - 1 ? observe : null}>
                  <MessageTile currentProfile={currentProfile} profile={profile} message={msg} />
                  {dateHasChanged ? <DateDivider date={lastMessageDate} /> : null}
                </div>
              );
              lastMessageDate = msg.sent;
              return messageDiv;
            })}
            {hasMore ? <LoadingMore /> : <ConversationBeginningNotice />}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(MessagesList);
