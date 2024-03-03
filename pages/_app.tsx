'use client'

import "@/styles/globals.css";
import "@/styles/canvas.css"
import type { AppProps } from "next/app";
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../config'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import SocketProvider from "@/context/SocketContext";

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <Component {...pageProps} />
        </SocketProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
