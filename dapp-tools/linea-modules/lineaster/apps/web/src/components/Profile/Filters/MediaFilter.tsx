import MenuTransition from '@components/Shared/MenuTransition';
import { Menu } from '@headlessui/react';
import { AdjustmentsIcon } from '@heroicons/react/outline';
import { t } from '@lingui/macro';
import type { ChangeEvent } from 'react';
import { useProfileFeedStore } from 'src/store/profile-feed';
import { Checkbox, Tooltip } from 'ui';

const MediaFilter = () => {
  const mediaFeedFilters = useProfileFeedStore((state) => state.mediaFeedFilters);
  const setMediaFeedFilters = useProfileFeedStore((state) => state.setMediaFeedFilters);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMediaFeedFilters({ ...mediaFeedFilters, [e.target.name]: e.target.checked });
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="rounded-md hover:bg-gray-300 hover:bg-opacity-20">
        <Tooltip placement="top" content="Filter">
          <AdjustmentsIcon className="text-brand h-5 w-5" />
        </Tooltip>
      </Menu.Button>
      <MenuTransition>
        <Menu.Items
          static
          className="absolute right-0 z-[5] mt-1 rounded-[2px] border uppercase  bg-dark dark:bg-black py-1 shadow-sm focus:outline-none dark:border-gray-700"
        >
          <Menu.Item
            as="div"
            className="hover:text-brand-500 py-1.5 text-gray-300 text-sm  flex justify-start px-5 cursor-pointer items-center hover:bg-black dark:hover:bg-dark gap-1"
          >
            <Checkbox
              onChange={handleChange}
              checked={mediaFeedFilters.images}
              name="images"
              label={t`Images`}
            />
          </Menu.Item>
          <Menu.Item
            as="div"
            className="hover:text-brand-500  py-1.5 text-gray-300 text-sm flex justify-start px-5 cursor-pointer items-center  hover:bg-black dark:hover:bg-dark gap-1 space-x-1 focus:outline-none"
          >
            <Checkbox
              onChange={handleChange}
              checked={mediaFeedFilters.video}
              name="video"
              label={t`Video`}
            />
          </Menu.Item>
          <Menu.Item
            as="div"
            className="hover:text-brand-500 py-1.5 text-gray-300 text-sm  flex justify-start px-5 cursor-pointer items-center hover:bg-black dark:hover:bg-dark gap-1 "
          >
            <Checkbox
              onChange={handleChange}
              checked={mediaFeedFilters.audio}
              name="audio"
              label={t`Audio`}
            />
          </Menu.Item>
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
};

export default MediaFilter;
