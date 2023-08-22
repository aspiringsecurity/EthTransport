import MetaTags from '@components/Common/MetaTags';
import Footer from '@components/Shared/Footer';
import { HeartIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import { t } from '@lingui/macro';
import { APP_NAME, STATIC_IMAGES_URL } from 'data/constants';
import { useTheme } from 'next-themes';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { PAGEVIEW } from 'src/tracking';

interface BrandProps {
  name: string;
  logo: string;
  url: string;
  size: number;
  type: 'svg' | 'png';
  children: ReactNode;
}

const Brand: FC<BrandProps> = ({ name, logo, url, size, type, children }) => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-5 pt-10">
      <img
        className="mx-auto"
        style={{ height: size }}
        src={`${STATIC_IMAGES_URL}/thanks/${logo}-${resolvedTheme === 'dark' ? 'dark' : 'light'}.${type}`}
        alt={`${name}'s Logo`}
      />
      <div className="mx-auto pt-2 sm:w-2/3">{children}</div>
      <div>
        <a className="font-bold" href={url} target="_blank" rel="noreferrer noopener">
          ➜ Go to {name}
        </a>
      </div>
    </div>
  );
};

const Thanks: FC = () => {
  useEffect(() => {
    Mixpanel.track(PAGEVIEW, { page: 'thanks' });
  }, []);

  return (
    <>
      <MetaTags title={t`Thanks • ${APP_NAME}`} />
      <div className="bg-brand-400 flex h-48 w-full items-center justify-center">
        <div className="relative text-center">
          <div className="flex items-center space-x-2 text-3xl font-bold text-white md:text-4xl">
            <div>Thank you!</div>
            <HeartIcon className="h-7 w-7 text-pink-600" />
          </div>
          <div className="text-white">for supporting our community</div>
        </div>
      </div>
      <div className="relative">
        <div className="flex justify-center">
          <div className="max-w-3/4 relative mx-auto rounded-lg lg:w-2/4">
            <div className="max-w-none space-y-10 divide-y px-5 pb-10 text-center text-gray-900 dark:divide-gray-700 dark:text-gray-200">
              <Brand
                name="Vercel"
                logo="vercel"
                url={`https://vercel.com/?utm_source=${APP_NAME}&utm_campaign=oss`}
                size={40}
                type="svg"
              >
                Vercel combines the best developer experience with an obsessive focus on end-user performance.
                Vercel platform enables frontend teams to do their best work.
              </Brand>
              <Brand name="4EVERLAND" logo="4everland" url="https://4everland.org" size={50} type="png">
                4EVERLAND is a Web 3.0 cloud computing platform that integrates storage, computing, and
                network core capabilities.
              </Brand>
            </div>
          </div>
        </div>
        <div className="flex justify-center px-5 pb-6 pt-2">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Thanks;
