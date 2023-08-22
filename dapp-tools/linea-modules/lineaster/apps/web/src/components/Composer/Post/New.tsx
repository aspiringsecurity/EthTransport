import { PencilAltIcon } from '@heroicons/react/outline';
import { t, Trans } from '@lingui/macro';
import formatHandle from 'lib/formatHandle';
import getAvatar from 'lib/getAvatar';
import { useRouter } from 'next/router';
import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAppStore } from 'src/store/app';
import { usePublicationStore } from 'src/store/publication';
import { Card, Image, Modal, Tooltip } from 'ui';

import NewPublication from '../NewPublication';

type Action = 'update' | 'image' | 'video' | 'audio' | 'article';

interface ActionProps {
  icon: ReactNode;
  text: string;
  onClick: () => void;
}

const Action: FC<ActionProps> = ({ icon, text, onClick }) => (
  <Tooltip content={text} placement="top">
    <button
      className="lt-text-gray-500 hover:text-brand flex flex-col items-center"
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  </Tooltip>
);

const NewPost: FC = () => {
  const { query, isReady, push } = useRouter();
  const currentProfile = useAppStore((state) => state.currentProfile);
  const showNewPostModal = usePublicationStore((state) => state.showNewPostModal);
  const setShowNewPostModal = usePublicationStore((state) => state.setShowNewPostModal);
  const setPublicationContent = usePublicationStore((state) => state.setPublicationContent);
  const [selectedAction, setSelectedAction] = useState<Action>('update');

  const openModal = (action: Action) => {
    setSelectedAction(action);
    setShowNewPostModal(true);
  };

  useEffect(() => {
    if (isReady && query.text) {
      const { text, url, via, hashtags } = query;
      let processedHashtags;

      if (hashtags) {
        processedHashtags = (hashtags as string)
          .split(',')
          .map((tag) => `#${tag} `)
          .join('');
      }

      const content = `${text}${processedHashtags ? ` ${processedHashtags} ` : ''}${url ? `\n\n${url}` : ''}${
        via ? `\n\nvia @${via}` : ''
      }`;

      setShowNewPostModal(true);
      setPublicationContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="space-y-3 border-0 p-5 dark:bg-transparent">
      <div className="flex items-center space-x-3">
        <Image
          onError={({ currentTarget }) => {
            currentTarget.src = getAvatar(currentProfile, false);
          }}
          src={getAvatar(currentProfile)}
          className="h-9 w-9 cursor-pointer rounded-full border bg-gray-200 dark:border-gray-700"
          onClick={() => push(`/u/${currentProfile?.handle}`)}
          alt={formatHandle(currentProfile?.handle)}
        />
        <button
          className="hover:bg-brand-500 flex  w-full items-center space-x-2 rounded-xl bg-gray-100 px-4 py-2 dark:bg-black dark:hover:bg-gray-700"
          type="button"
          onClick={() => openModal('update')}
        >
          <PencilAltIcon className="h-5 w-5" />
          <span>
            <Trans>What's happening?</Trans>
          </span>
        </button>
        <Modal
          title={t`Create post`}
          size="md"
          show={showNewPostModal}
          onClose={() => setShowNewPostModal(false)}
        >
          {selectedAction === 'update' && <NewPublication />}
        </Modal>
      </div>
    </Card>
  );
};

export default NewPost;
