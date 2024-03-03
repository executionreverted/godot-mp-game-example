import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, avalancheFuji } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
export const PORT = parseInt(process.env.PORT as any) || 3000

export const wagmiConfig = createConfig({
    chains: [avalancheFuji],
    transports: {
        [avalancheFuji.id]: http(),
    },
    multiInjectedProviderDiscovery: false,
    connectors: [injected({
        shimDisconnect: false
    })],
    ssr: false,
    syncConnectedChain: true,

})