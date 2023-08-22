import { BellIcon } from '@heroicons/react/outline';
import { CustomFiltersTypes, useNotificationCountQuery } from 'lens';
import Link from 'next/link';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useAppPersistStore, useAppStore } from 'src/store/app';

const NotificationIcon: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const notificationCount = useAppPersistStore((state) => state.notificationCount);
  const setNotificationCount = useAppPersistStore((state) => state.setNotificationCount);
  const [showBadge, setShowBadge] = useState(false);
  const { data } = useNotificationCountQuery({
    variables: { request: { profileId: currentProfile?.id, customFilters: [CustomFiltersTypes.Gardeners] } },
    skip: !currentProfile?.id,
    fetchPolicy: 'no-cache' // without no-cache the totalcount is NaN and returns the same.
  });

  useEffect(() => {
    if (currentProfile && data) {
      const currentCount = data?.notifications?.pageInfo?.totalCount || 0;
      setShowBadge(notificationCount !== currentCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Link
      href="/notifications"
      className="hover:text-brand-500 hidden min-w-[40px] items-start justify-center p-1 text-white md:flex"
      onClick={() => {
        setNotificationCount(data?.notifications?.pageInfo?.totalCount || 0);
        setShowBadge(false);
      }}
    >
      <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      {showBadge && <span className="h-2 w-2 rounded-full bg-red-500" />}
    </Link>
  );
};

export default NotificationIcon;
