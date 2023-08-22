import { EmojiHappyIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import clsx from 'clsx';
import getProfileAttribute from 'lib/getProfileAttribute';
import type { FC } from 'react';
import React from 'react';
import { useAppStore } from 'src/store/app';
import { useGlobalModalStateStore } from 'src/store/modals';

interface StatusProps {
  className?: string;
}

const Status: FC<StatusProps> = ({ className = '' }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const setShowStatusModal = useGlobalModalStateStore((state) => state.setShowStatusModal);

  const statusEmoji = getProfileAttribute(currentProfile?.attributes, 'statusEmoji');
  const statusMessage = getProfileAttribute(currentProfile?.attributes, 'statusMessage');
  const hasStatus = statusEmoji && statusMessage;

  return (
    <button
      type="button"
      className={clsx('flex w-full items-center space-x-2 px-4 py-1.5 text-sm', className)}
      onClick={() => setShowStatusModal(true)}
    >
      {hasStatus ? (
        <>
          <span>{statusEmoji}</span>
          <span className="truncate">{statusMessage}</span>
        </>
      ) : (
        <>
          <EmojiHappyIcon className="h-4 w-4" />
          <span>
            <Trans>Set status</Trans>
          </span>
        </>
      )}
    </button>
  );
};

export default Status;
