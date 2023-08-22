import Profiles from '@components/Shared/Profiles';
import { SwitchHorizontalIcon } from '@heroicons/react/outline';
import { t } from '@lingui/macro';
import type { Mirror } from 'lens';
import type { FC } from 'react';

interface MirroredProps {
  publication: Mirror;
}

const Mirrored: FC<MirroredProps> = ({ publication }) => {
  return (
    <div className="lt-text-gray-500 flex items-center space-x-1 pb-4 text-[13px]">
      <SwitchHorizontalIcon className="h-4 w-4" />
      <Profiles profiles={[publication.profile]} context={t`mirrored`} />
    </div>
  );
};

export default Mirrored;
