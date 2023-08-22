import ToggleWithHelper from '@components/Shared/ToggleWithHelper';
import { PlusIcon, SwitchHorizontalIcon, UsersIcon, XCircleIcon } from '@heroicons/react/outline';
import isValidEthAddress from '@lib/isValidEthAddress';
import { t, Trans } from '@lingui/macro';
import { HANDLE_SUFFIX, LENSPROTOCOL_HANDLE } from 'data/constants';
import { useProfileLazyQuery } from 'lens';
import splitNumber from 'lib/splitNumber';
import type { FC } from 'react';
import { useAppStore } from 'src/store/app';
import { useCollectModuleStore } from 'src/store/collect-module';
import { Button, Input } from 'ui';

interface SplitConfigProps {
  isRecipientsDuplicated: () => boolean;
}

const SplitConfig: FC<SplitConfigProps> = ({ isRecipientsDuplicated }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const recipients = useCollectModuleStore((state) => state.recipients);
  const setRecipients = useCollectModuleStore((state) => state.setRecipients);

  const hasRecipients = recipients.length > 0;
  const splitTotal = recipients.reduce((acc, curr) => acc + curr.split, 0);

  const [getProfileByHandle, { loading }] = useProfileLazyQuery();

  const splitEvenly = () => {
    const equalSplits = splitNumber(100, recipients.length);
    const splits = recipients.map((recipient, i) => {
      return {
        recipient: recipient.recipient,
        split: equalSplits[i]
      };
    });
    setRecipients([...splits]);
  };

  const getIsHandle = (handle: string) => {
    return handle === LENSPROTOCOL_HANDLE ? true : handle.includes(HANDLE_SUFFIX);
  };

  const onChangeRecipientOrSplit = (index: number, value: string, type: 'recipient' | 'split') => {
    const getRecipients = (value: string) => {
      return recipients.map((recipient, i) => {
        if (i === index) {
          return {
            ...recipient,
            [type]: type === 'split' ? parseInt(value) : value
          };
        }
        return recipient;
      });
    };

    if (type === 'recipient' && getIsHandle(value)) {
      getProfileByHandle({
        variables: { request: { handle: value } },
        onCompleted: ({ profile }) => {
          if (profile) {
            setRecipients(getRecipients(profile.ownedBy));
          }
        }
      });
    }

    setRecipients(getRecipients(value));
  };

  return (
    <div className="pt-5">
      <ToggleWithHelper
        on={recipients.length > 0}
        setOn={() => {
          if (recipients.length > 0) {
            setRecipients([]);
          } else {
            setRecipients([{ recipient: currentProfile?.ownedBy, split: 100 }]);
          }
        }}
        heading={
          <div className="flex items-center space-x-2">
            <span>
              <Trans>Split revenue</Trans>
            </span>
          </div>
        }
        description={t`Set multiple recipients for the collect fee`}
        icon={<UsersIcon className="h-4 w-4" />}
      />
      {hasRecipients ? (
        <div className="space-y-3 pt-4">
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Input
                  placeholder="0x3A5bd...5e3 or wagmi.lens"
                  value={recipient.recipient}
                  disabled={loading}
                  error={recipient.recipient.length > 0 && !isValidEthAddress(recipient.recipient)}
                  onChange={(event) => onChangeRecipientOrSplit(index, event.target.value, 'recipient')}
                />
                <div className="w-1/3">
                  <Input
                    type="number"
                    placeholder="5"
                    min="1"
                    max="100"
                    value={recipient.split}
                    iconRight="%"
                    onChange={(event) => onChangeRecipientOrSplit(index, event.target.value, 'split')}
                  />
                </div>
                <button
                  onClick={() => {
                    setRecipients(recipients.filter((_, i) => i !== index));
                  }}
                >
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            {recipients.length >= 5 ? (
              <div />
            ) : (
              <Button
                size="sm"
                outline
                icon={<PlusIcon className="h-3 w-3" />}
                onClick={() => {
                  setRecipients([...recipients, { recipient: '', split: 0 }]);
                }}
              >
                Add recipient
              </Button>
            )}

            <Button
              size="sm"
              outline
              icon={<SwitchHorizontalIcon className="h-3 w-3" />}
              onClick={splitEvenly}
            >
              Split evenly
            </Button>
          </div>
          {splitTotal > 100 ? (
            <div className="text-sm font-bold text-red-500">
              <Trans>
                Splits cannot exceed 100%. Total: <span>{splitTotal}</span>%
              </Trans>
            </div>
          ) : null}
          {isRecipientsDuplicated() ? (
            <div className="text-sm font-bold text-red-500">
              <Trans>Duplicate recipient address found</Trans>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SplitConfig;
