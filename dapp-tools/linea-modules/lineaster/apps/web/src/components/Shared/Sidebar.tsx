import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FC, ReactNode } from 'react';

interface MenuProps {
  children: ReactNode;
  current: boolean;
  url: string;
}

const Menu: FC<MenuProps> = ({ children, current, url }) => (
  <Link
    href={url}
    className={clsx(
      'hover:bg-brand-100 hover:text-brand flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-opacity-100 dark:bg-opacity-20 dark:hover:bg-opacity-20',
      { 'bg-brand-100 text-brand font-bold': current }
    )}
  >
    {children}
  </Link>
);

interface SidebarProps {
  items: {
    title: ReactNode;
    icon: ReactNode;
    url: string;
    enabled?: boolean;
  }[];
}

const Sidebar: FC<SidebarProps> = ({ items }) => {
  const { pathname } = useRouter();
  const menuItems = items.map((item) => ({ ...item, enabled: item.enabled ?? true }));

  return (
    <div className="mb-4 space-y-1.5 px-3 sm:px-0">
      {menuItems.map((item: any, index: number) =>
        item?.enabled ? (
          <Menu key={index} current={pathname === item.url} url={item.url}>
            {item.icon}
            <div>{item.title}</div>
          </Menu>
        ) : null
      )}
    </div>
  );
};

export default Sidebar;
