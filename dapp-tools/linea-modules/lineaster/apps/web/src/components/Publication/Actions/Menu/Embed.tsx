import { Menu } from '@headlessui/react';
import { CodeIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import type { Publication } from 'lens';
import { stopEventPropagation } from 'lib/stopEventPropagation';
import type { FC } from 'react';
import { PUBLICATION } from 'src/tracking';

interface EmbedProps {
  publication: Publication;
}

const Embed: FC<EmbedProps> = ({ publication }) => {
  return (
    <Menu.Item
      as="a"
      className="block cursor-pointer rounded-md px-4 py-1.5 text-sm outline-none focus:outline:none hover:bg-black dark:hover:bg-dark hover:text-brand-500"
      onClick={(event) => {
        stopEventPropagation(event);
        Mixpanel.track(PUBLICATION.EMBED);
      }}
      href={`https://embed.withlens.app/?url=${publication?.id}`}
      target="_blank"
    >
      <div className="flex items-center justify-start space-x-2">
        <CodeIcon className="h-4 w-4 uppercase" />
        <div>Embed</div>
      </div>
    </Menu.Item>
  );
};

export default Embed;
