import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React from 'react'
import { WagmiConfig } from 'wagmi'
import wagmiClient from '../wagmi/config'
import Layout from '../components/Layout'
import {NotificationProvider} from '@web3uikit/core'

export default function App({ Component, pageProps }: AppProps) {

  return <div className='w-full min-h-screen'>
    <WagmiConfig client={wagmiClient}>
      <NotificationProvider>
        <Layout >
          <Component {...pageProps} />  
        </Layout>
      </NotificationProvider>
    </WagmiConfig>
  </div>
}
