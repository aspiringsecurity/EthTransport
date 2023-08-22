import MetaTags from '@components/Common/MetaTags';
import UserProfile from '@components/Shared/UserProfile';
import { useDisconnectXmtp } from '@components/utils/hooks/useXmtpClient';
import { ExclamationIcon, TrashIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import onError from '@lib/onError';
import resetAuthData from '@lib/resetAuthData';
import splitSignature from '@lib/splitSignature';
import { t, Trans } from '@lingui/macro';
import { LensHub } from 'abis';
import { APP_NAME, LENSHUB_PROXY } from 'data/constants';
import Errors from 'data/errors';
import { useCreateBurnProfileTypedDataMutation } from 'lens';
import getSignature from 'lib/getSignature';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Custom404 from 'src/pages/404';
import { useAppPersistStore, useAppStore } from 'src/store/app';
import { PAGEVIEW } from 'src/tracking';
import { Button, Card, GridItemEight, GridItemFour, GridLayout, Modal, Spinner, WarningMessage } from 'ui';
import { useContractWrite, useDisconnect, useSignTypedData } from 'wagmi';

import SettingsSidebar from '../Sidebar';

const DeleteSettings: FC = () => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({ onError });
  const disconnectXmtp = useDisconnectXmtp();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    Mixpanel.track(PAGEVIEW, { page: 'settings', subpage: 'delete' });
  }, []);

  const onCompleted = () => {
    setCurrentProfile(null);
    setProfileId(null);
    disconnectXmtp();
    resetAuthData();
    disconnect?.();
    location.href = '/';
  };

  const { isLoading: writeLoading, write } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: 'burnWithSig',
    mode: 'recklesslyUnprepared',
    onSuccess: onCompleted,
    onError
  });

  const [createBurnProfileTypedData, { loading: typedDataLoading }] = useCreateBurnProfileTypedDataMutation({
    onCompleted: async ({ createBurnProfileTypedData }) => {
      const { typedData } = createBurnProfileTypedData;
      const { tokenId, deadline } = typedData.value;
      const signature = await signTypedDataAsync(getSignature(typedData));
      const { v, r, s } = splitSignature(signature);
      const sig = { v, r, s, deadline };

      setUserSigNonce(userSigNonce + 1);
      write?.({ recklesslySetUnpreparedArgs: [tokenId, sig] });
    },
    onError
  });

  const handleDelete = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      await createBurnProfileTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: { profileId: currentProfile?.id }
        }
      });
    } catch {}
  };

  const isDeleting = typedDataLoading || signLoading || writeLoading;

  if (!currentProfile) {
    return <Custom404 />;
  }

  return (
    <GridLayout>
      <MetaTags title={t`Delete Profile • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsSidebar />
      </GridItemFour>
      <GridItemEight>
        <Card className="space-y-5 p-5">
          <UserProfile profile={currentProfile} />
          <div className="text-lg font-bold text-red-500">
            <Trans>This will deactivate your account</Trans>
          </div>
          <p>
            <Trans>
              Deleting your account is permanent. All your data will be wiped out immediately and you won't be
              able to get it back.
            </Trans>
          </p>
          <div className="text-lg font-bold">What else you should know</div>
          <div className="lt-text-gray-500 divide-y text-sm dark:divide-gray-700">
            <p className="pb-3">
              <Trans>
                You cannot restore your {APP_NAME} account if it was accidentally or wrongfully deleted.
              </Trans>
            </p>
            <p className="py-3">
              <Trans>
                Some account information may still be available in search engines, such as Google or Bing.
              </Trans>
            </p>
            <p className="py-3">
              <Trans>Your @handle will be released immediately after deleting the account.</Trans>
            </p>
          </div>
          <Button
            variant="danger"
            icon={isDeleting ? <Spinner variant="danger" size="xs" /> : <TrashIcon className="h-5 w-5" />}
            disabled={isDeleting}
            onClick={() => setShowWarningModal(true)}
          >
            {isDeleting ? t`Deleting...` : t`Delete your account`}
          </Button>
          <Modal
            title={t`Danger Zone`}
            icon={<ExclamationIcon className="h-5 w-5 text-red-500" />}
            show={showWarningModal}
            onClose={() => setShowWarningModal(false)}
          >
            <div className="space-y-3 p-5">
              <WarningMessage
                title="Are you sure?"
                message={
                  <div className="leading-6">
                    <Trans>
                      Confirm that you have read all consequences and want to delete your account anyway
                    </Trans>
                  </div>
                }
              />
              <Button
                variant="danger"
                icon={<TrashIcon className="h-5 w-5" />}
                onClick={() => {
                  setShowWarningModal(false);
                  handleDelete();
                }}
              >
                <Trans>Yes, delete my account</Trans>
              </Button>
            </div>
          </Modal>
        </Card>
      </GridItemEight>
    </GridLayout>
  );
};

export default DeleteSettings;
