import { CheckCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import clsx from 'clsx';
import { LINEA_EXPLORER_URL } from 'data/constants';
import { useHasTxHashBeenIndexedQuery } from 'lens';
import type { FC } from 'react';
import { useState } from 'react';
import { Spinner } from 'ui';

interface IndexStatusProps {
  type?: string;
  txHash: string;
  reload?: boolean;
}

const IndexStatus: FC<IndexStatusProps> = ({ type = 'Transaction', txHash, reload = false }) => {
  const [hide, setHide] = useState(false);
  const [pollInterval, setPollInterval] = useState(500);
  const { data, loading } = useHasTxHashBeenIndexedQuery({
    variables: { request: { txHash } },
    pollInterval,
    onCompleted: ({ hasTxHashBeenIndexed }) => {
      if (hasTxHashBeenIndexed.__typename === 'TransactionIndexedResult' && hasTxHashBeenIndexed?.indexed) {
        setPollInterval(0);
        if (reload) {
          location.reload();
        }
        setTimeout(() => {
          setHide(true);
        }, 5000);
      }
    }
  });

  return (
    <a
      className={clsx({ hidden: hide }, 'ml-auto text-sm font-medium')}
      href={`${LINEA_EXPLORER_URL}/tx/${txHash}`}
      target="_blank"
      rel="noreferrer noopener"
    >
      {loading ||
      (data?.hasTxHashBeenIndexed.__typename === 'TransactionIndexedResult' &&
        !data?.hasTxHashBeenIndexed.indexed) ? (
        <div className="flex items-center space-x-1.5">
          <Spinner size="xs" />
          <div>
            <Trans>{type} Indexing</Trans>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-1">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <div className="text-black dark:text-white">
            <Trans>Index Successful</Trans>
          </div>
        </div>
      )}
    </a>
  );
};

export default IndexStatus;
