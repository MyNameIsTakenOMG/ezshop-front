import {chain,configureChains, createClient, defaultChains} from 'wagmi'
import {alchemyProvider} from 'wagmi/providers/alchemy'
import {publicProvider} from 'wagmi/providers/public'
import {InjectedConnector} from 'wagmi/connectors/injected'

const {chains,provider} = configureChains([chain.goerli],[
    alchemyProvider({apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!}),
    publicProvider()
])

const wagmiClient = createClient({
    autoConnect:false,
    provider,
    connectors:[new InjectedConnector({chains})]
})


export default wagmiClient