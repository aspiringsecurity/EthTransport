import { CollectionIcon, GlobeAltIcon, HashtagIcon, LinkIcon } from '@heroicons/react/outline';
import { ShieldCheckIcon } from '@heroicons/react/solid';
import type { Publication } from 'lens';
import sanitizeDStorageUrl from 'lib/sanitizeDStorageUrl';
import type { FC } from 'react';
import { Card } from 'ui';

import MetaDetails from './MetaDetails';

interface PublicationStaffToolProps {
  publication: Publication;
}

const PublicationStaffTool: FC<PublicationStaffToolProps> = ({ publication }) => {
  const isComment = publication.__typename === 'Comment';

  return (
    <Card as="aside" className="mt-5 border-yellow-400 !bg-yellow-300 !bg-opacity-20 p-5">
      <div className="flex items-center space-x-2 text-yellow-600">
        <ShieldCheckIcon className="h-5 w-5" />
        <div className="text-lg font-bold">Staff tool</div>
      </div>
      <div className="mt-3 space-y-1.5">
        <MetaDetails
          icon={<HashtagIcon className="lt-text-gray-500 h-4 w-4" />}
          value={publication?.id}
          title="Publication ID"
        >
          {publication?.id}
        </MetaDetails>
        {isComment ? (
          <MetaDetails
            icon={<HashtagIcon className="lt-text-gray-500 h-4 w-4" />}
            value={publication?.commentOn?.id}
            title="Parent ID"
          >
            {publication?.commentOn?.id}
          </MetaDetails>
        ) : null}
        <MetaDetails
          icon={<CollectionIcon className="lt-text-gray-500 h-4 w-4" />}
          value={publication?.collectModule?.type}
          title="Collect module"
        >
          {publication?.collectModule?.type}
        </MetaDetails>
        <MetaDetails
          icon={<GlobeAltIcon className="lt-text-gray-500 h-4 w-4" />}
          value={publication?.id}
          title="Posted via"
        >
          {publication?.appId}
        </MetaDetails>
        <MetaDetails
          icon={<LinkIcon className="lt-text-gray-500 h-4 w-4" />}
          value={sanitizeDStorageUrl(publication?.onChainContentURI)}
          title="On-chain content URI"
        >
          <a href={sanitizeDStorageUrl(publication?.onChainContentURI)} target="_blank" rel="noreferrer">
            Open
          </a>
        </MetaDetails>
      </div>
    </Card>
  );
};

export default PublicationStaffTool;
