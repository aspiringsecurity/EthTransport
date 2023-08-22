import Report from '@components/Shared/Modal/Report';
import { ArrowCircleRightIcon, EmojiHappyIcon, ShieldCheckIcon } from '@heroicons/react/outline';
import { t } from '@lingui/macro';
import type { FC } from 'react';
import { useAuthStore } from 'src/store/auth';
import { useGlobalModalStateStore } from 'src/store/modals';
import { Modal } from 'ui';

import Login from './Login';
import Status from './Status';
import SwitchProfiles from './SwitchProfiles';

const GlobalModals: FC = () => {
  // Report modal state
  const showReportModal = useGlobalModalStateStore((state) => state.showReportModal);
  const reportingPublication = useGlobalModalStateStore((state) => state.reportingPublication);
  const setShowReportModal = useGlobalModalStateStore((state) => state.setShowReportModal);
  const showStatusModal = useGlobalModalStateStore((state) => state.showStatusModal);
  const setShowStatusModal = useGlobalModalStateStore((state) => state.setShowStatusModal);
  const showProfileSwitchModal = useGlobalModalStateStore((state) => state.showProfileSwitchModal);
  const setShowProfileSwitchModal = useGlobalModalStateStore((state) => state.setShowProfileSwitchModal);
  const showAuthModal = useAuthStore((state) => state.showAuthModal);
  const setShowAuthModal = useAuthStore((state) => state.setShowAuthModal);

  return (
    <>
      {reportingPublication ? (
        <Modal
          title={t`Report`}
          icon={<ShieldCheckIcon className="text-brand h-5 w-5" />}
          show={showReportModal}
          onClose={() => setShowReportModal(false, reportingPublication)}
        >
          <Report publication={reportingPublication} />
        </Modal>
      ) : null}
      <Modal
        title={t`Set status`}
        icon={<EmojiHappyIcon className="text-brand h-5 w-5" />}
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      >
        <Status />
      </Modal>
      <Modal
        title={t`Change Profile`}
        show={showProfileSwitchModal}
        onClose={() => setShowProfileSwitchModal(false)}
        size="xs"
      >
        <SwitchProfiles />
      </Modal>
      <Modal
        title={t`Login`}
        icon={<ArrowCircleRightIcon className="text-brand h-5 w-5" />}
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        dataTestId="login-modal"
      >
        <Login />
      </Modal>
    </>
  );
};

export default GlobalModals;
