import MenuTransition from '@components/Shared/MenuTransition';
import { Menu } from '@headlessui/react';
import { AdjustmentsIcon } from '@heroicons/react/outline';
import { t } from '@lingui/macro';
import clsx from 'clsx';
import type { ChangeEvent, FC } from 'react';
import { useTimelinePersistStore } from 'src/store/timeline';
import { Checkbox, Tooltip } from 'ui';

const FeedEventFilters: FC = () => {
  const feedEventFilters = useTimelinePersistStore((state) => state.feedEventFilters);
  const setFeedEventFilters = useTimelinePersistStore((state) => state.setFeedEventFilters);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFeedEventFilters({ ...feedEventFilters, [e.target.name]: e.target.checked });
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="rounded-md p-1 hover:bg-gray-300 hover:bg-opacity-20">
        <Tooltip placement="top" content={t`Filter`}>
          <AdjustmentsIcon className="text-brand h-5 w-5" />
        </Tooltip>
      </Menu.Button>
      <MenuTransition>
        <Menu.Items
          static
          className="absolute right-0 z-[5] mt-1 rounded-xl border bg-white py-1 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          <Menu.Item
            as="label"
            className={({ active }) =>
              clsx(
                { 'dropdown-active': active },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              onChange={handleChange}
              checked={feedEventFilters.posts}
              name="posts"
              label={t`Show Posts`}
            />
          </Menu.Item>
          <Menu.Item
            as="label"
            className={({ active }) =>
              clsx(
                { 'dropdown-active': active },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              onChange={handleChange}
              checked={feedEventFilters.mirrors}
              name="mirrors"
              label={t`Show Mirrors`}
            />
          </Menu.Item>
          <Menu.Item
            as="label"
            className={({ active }) =>
              clsx(
                { 'dropdown-active': active },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              onChange={handleChange}
              checked={feedEventFilters.likes}
              name="likes"
              label={t`Show Likes`}
            />
          </Menu.Item>
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
};

export default FeedEventFilters;
