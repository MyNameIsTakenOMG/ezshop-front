import { ApolloClient, InMemoryCache } from "@apollo/client"

const endpoint = process.env.NEXT_PUBLIC_THEGRAPH_ENDPOINT
const client = new ApolloClient({
    uri:endpoint,
    cache: new InMemoryCache()
})

export default client