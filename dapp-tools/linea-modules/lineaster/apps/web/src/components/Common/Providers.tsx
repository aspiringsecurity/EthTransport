import { initLocale } from '@lib/i18n';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lineaTestnet } from '@wagmi/chains';
import { INFURA_KEY } from 'data';
import { ApolloProvider, webClient } from 'lens/apollo';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import ErrorBoundary from './ErrorBoundary';
import Layout from './Layout';

const { chains, provider } = configureChains(
  [lineaTestnet],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: `https://linea-goerli.infura.io/v3/${INFURA_KEY}`
      })
    }),
    publicProvider()
  ]
);

const connectors = () => {
  return [
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new WalletConnectLegacyConnector({
      chains,
      options: {
        qrcode: true,
        qrcodeModalOptions: {
          desktopLinks: [],
          mobileLinks: ['MetaMask']
        }
      }
    })
  ];
};

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

const queryClient = new QueryClient();
const apolloClient = webClient;

const Providers = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    initLocale();
  }, []);

  return (
    <I18nProvider i18n={i18n}>
      <ErrorBoundary>
        <WagmiConfig client={wagmiClient}>
          <ApolloProvider client={apolloClient}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider attribute="class">
                <Layout>{children}</Layout>
              </ThemeProvider>
            </QueryClientProvider>
          </ApolloProvider>
        </WagmiConfig>
      </ErrorBoundary>
    </I18nProvider>
  );
};

export default Providers;
