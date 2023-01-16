/*
* adapted from https://github.com/web3-storage/w3console/blob/main/components/UploadsList.js
*/
import React from 'react'
import Link from 'next/link'
import { useUploadsList } from '@w3ui/react-uploads-list'
import { useAuth, AuthStatus } from '@w3ui/react-keyring'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import { Loading, SmallLoading } from './Loading'
import { withIdentity } from './Authenticator'
import Button from './Button'

export function UploadsList() {
  const { loading, error, data, reload } = useUploadsList()
  const { authStatus } = useAuth()

  if (authStatus !== AuthStatus.SignedIn) return null
  if (error && authStatus === AuthStatus.SignedIn) {
    return <Errored error={error} />
  }

  return (
    <div className='w-full my-8'>
      {data && data.results.length
        ? (
          <div className='flex flex-col mx-24'>
            {data.results.sort(({ uploadedAt: a }, { uploadedAt: b }) => b - a).map(({ dataCid, uploadedAt }) => (
              <div key={dataCid}
                className="flex flex-row justify-between hover:bg-gray-200 p-4">
                <div className="flex flex-col">
                  <span className="block truncate w-48 text-xl text-gradient-with-hover font-bold">
                    <Link href={`/notes/${dataCid}`}>{dataCid}</Link>
                  </span>
                  <a href={`https://${dataCid}.ipfs.w3s.link`}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                    target="_blank" rel="noreferrer nofollow">
                    (raw)
                  </a>
                </div>
                <span className="ml-8">{uploadedAt.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex flex-row justify-center">
              <Button onClick={reload}>Refresh {loading && <SmallLoading />}</Button>
            </div>
          </div>
        )
        : (loading ? (<div className="flex flex-row justify-center"><Loading/ ></div>) : (<p className='tc my-5'>No uploads</p>))}
    </div>
  )
}

const Errored = ({ error }) => (
  <div className='h-32 flex items-start p-8 bg-gray-900 rounded-md mt-5'>
    <ExclamationTriangleIcon className='w-8 h-8 mr-4 text-yellow-500' />
    <div>
      <h1 className="mb-1 text-lg">Error: failed to list uploads: {error.message}</h1>
      <p className="opacity-70">Check the browser console for details.</p>
    </div>
  </div>
)

export default withIdentity(UploadsList)
