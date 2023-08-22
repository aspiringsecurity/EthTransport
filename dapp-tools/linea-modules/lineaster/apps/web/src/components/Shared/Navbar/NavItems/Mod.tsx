import { ShieldCheckIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import clsx from 'clsx';
import type { FC } from 'react';
import React from 'react';

interface ModProps {
  className?: string;
}

const Mod: FC<ModProps> = ({ className = '' }) => {
  return (
    <div className={clsx('flex w-full items-center space-x-1.5', className)}>
      <ShieldCheckIcon className="h-4 w-4" />
      <div>
        <Trans>Moderation</Trans>
      </div>
    </div>
  );
};

export default Mod;
