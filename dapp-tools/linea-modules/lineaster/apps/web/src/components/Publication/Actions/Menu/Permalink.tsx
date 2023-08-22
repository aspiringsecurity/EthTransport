import { Menu } from '@headlessui/react';
import { ClipboardCopyIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import { t } from '@lingui/macro';
import type { Publication } from 'lens';
import type { FC } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { PUBLICATION } from 'src/tracking';

interface PermalinkProps {
  publication: Publication;
}

const Permalink: FC<PermalinkProps> = ({ publication }) => {
  return (
    <CopyToClipboard
      text={`${location.origin}/posts/${publication?.id}`}
      onCopy={() => {
        toast.success(t`Copied to clipboard!`);
        Mixpanel.track(PUBLICATION.PERMALINK);
      }}
    >
      <Menu.Item
        as="div"
        className="block cursor-pointer rounded-md px-4 py-1.5 text-sm outline-none focus:outline:none hover:bg-black dark:hover:bg-dark hover:text-brand-500"
      >
        <div className="flex items-center justify-start space-x-2">
          <ClipboardCopyIcon className="h-4 w-4 uppercase" />
          <div>Permalink</div>
        </div>
      </Menu.Item>
    </CopyToClipboard>
  );
};

export default Permalink;
