import MetaTags from '@components/Common/MetaTags';
import { Mixpanel } from '@lib/mixpanel';
import { t, Trans } from '@lingui/macro';
import { APP_NAME } from 'data/constants';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import Custom404 from 'src/pages/404';
import { useAppStore } from 'src/store/app';
import { PAGEVIEW } from 'src/tracking';
import { Card, GridItemEight, GridLayout } from 'ui';

import PreviewList from './PreviewList';

const NoConversationSelected = () => {
  return (
    <div className="flex h-full flex-col text-center">
      <div className="m-auto">
        <span className="text-center text-5xl">👋</span>
        <h3 className="mb-2 mt-3 text-lg uppercase">
          <Trans>Select conversation</Trans>
        </h3>
        <p className="text-md lt-text-gray-500 max-w-xs">
          <Trans>Choose an existing conversation or create a new one to start messaging</Trans>
        </p>
      </div>
    </div>
  );
};

const Messages: NextPage = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  useEffect(() => {
    Mixpanel.track(PAGEVIEW, { page: 'messages' });
  }, []);

  if (!currentProfile) {
    return <Custom404 />;
  }

  return (
    <GridLayout classNameChild="md:gap-8">
      <MetaTags title={t`Messages • ${APP_NAME}`} />
      <PreviewList />
      <GridItemEight className="xs:hidden xs:mx-2 mb-0 sm:mx-2 sm:hidden sm:h-[76vh] md:col-span-8 md:hidden md:h-[80vh] lg:block xl:h-[84vh]">
        <Card className="h-full">
          <NoConversationSelected />
        </Card>
      </GridItemEight>
    </GridLayout>
  );
};

export default Messages;
