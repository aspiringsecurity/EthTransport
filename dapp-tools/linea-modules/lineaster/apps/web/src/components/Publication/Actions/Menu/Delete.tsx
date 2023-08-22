import { Menu } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/outline';
import type { Publication } from 'lens';
import { stopEventPropagation } from 'lib/stopEventPropagation';
import type { FC } from 'react';
import { useGlobalAlertStateStore } from 'src/store/alerts';

interface DeleteProps {
  publication: Publication;
}

const Delete: FC<DeleteProps> = ({ publication }) => {
  const setShowPublicationDeleteAlert = useGlobalAlertStateStore(
    (state) => state.setShowPublicationDeleteAlert
  );

  return (
    <Menu.Item
      as="div"
      className="my-1 block cursor-pointer rounded-md px-4 py-1.5 text-sm hover:bg-black dark:hover:bg-dark hover:text-brand-500 text-red-500"
      onClick={(event) => {
        stopEventPropagation(event);
        setShowPublicationDeleteAlert(true, publication);
      }}
    >
      <div className="flex items-center justify-start space-x-2">
        <TrashIcon className="h-4 w-4 uppercase" />
        <div>Delete</div>
      </div>
    </Menu.Item>
  );
};

export default Delete;
