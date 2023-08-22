import { ArrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { gql, useQuery } from 'lens/apollo';
import Link from 'next/link';
import type { FC } from 'react';
import { Button, Spinner } from 'ui';

const HAS_PUBLICATION_INDEXED_QUERY = gql`
  query HasPubicationIndexed($request: PublicationQueryRequest!) {
    publication(request: $request) {
      ... on Post {
        id
      }
    }
  }
`;

interface PendingProps {
  txHash: string;
  indexing: string;
  indexed: string;
  type: string;
  urlPrefix: string;
}

const Pending: FC<PendingProps> = ({ txHash, indexing, indexed, type, urlPrefix }) => {
  const { data, loading } = useQuery(HAS_PUBLICATION_INDEXED_QUERY, {
    variables: { request: { txHash } },
    pollInterval: 1000
  });

  return (
    <div className="p-5 py-10 text-center font-bold">
      {loading || !data?.publication?.id ? (
        <div className="space-y-3">
          <Spinner className="mx-auto" />
          <div>{indexing}</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-[40px]">🌿</div>
          <div>{indexed}</div>
          <div className="pt-3">
            <Link href={`/${urlPrefix}/${data?.publication?.id}`}>
              <Button className="mx-auto" icon={<ArrowRightIcon className="mr-1 h-4 w-4" />}>
                <Trans>Go to {type}</Trans>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pending;
