import '../styles/globals.css'
import Head from 'next/head'
import { UploaderProvider } from '@w3ui/react-uploader'
import { AuthProvider } from '@w3ui/react-keyring'
import { UploadsListProvider } from '@w3ui/react-uploads-list';

import Layout from '../components/Layout'

function MyApp({ Component, pageProps }) {

  return (
    <>
      <Head>
        <title>w3notes</title>
        <meta name="description" content="Notes from the permaweb" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <UploaderProvider>
          <UploadsListProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </UploadsListProvider>
        </UploaderProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp

