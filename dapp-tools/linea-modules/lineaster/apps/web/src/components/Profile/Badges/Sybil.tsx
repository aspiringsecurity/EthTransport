import { CheckCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { STATIC_IMAGES_URL } from 'data/constants';
import type { Profile } from 'lens';
import type { FC } from 'react';
import { Tooltip } from 'ui';

interface SybilProps {
  profile: Profile;
}

const Sybil: FC<SybilProps> = ({ profile }) => {
  if (!profile?.onChainIdentity?.sybilDotOrg?.verified) {
    return null;
  }

  return (
    <Tooltip
      content={
        <span>
          <span className="flex items-center space-x-1">
            <span>
              <Trans>Sybil verified</Trans>
            </span>
            <CheckCircleIcon className="h-4 w-4" />
          </span>
          <span>
            Twitter: <b>@{profile?.onChainIdentity?.sybilDotOrg?.source?.twitter?.handle}</b>
          </span>
        </span>
      }
      placement="top"
    >
      <img
        className="drop-shadow-xl"
        height={75}
        width={75}
        src={`${STATIC_IMAGES_URL}/badges/sybil.png`}
        alt="Sybil Badge"
        data-testid="profile-sybil-badge"
      />
    </Tooltip>
  );
};

export default Sybil;
