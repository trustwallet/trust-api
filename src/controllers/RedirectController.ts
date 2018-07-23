import { Nodes, CoinTypeIndex, Endpoints } from "../controllers/Interfaces/Servers"
import * as BluebirbPromise from "bluebird";
import axios from "axios";

export class Redirect {

    public redirect = (req, res) => {
        const url = this.getRedirectUrl(req)
        res.redirect(url)
    }

    public getAddressAllTokens = async (req, res) => {
        const json = {docs: []}
        const networks = Object.keys(CoinTypeIndex)
        const bodyNetworks = Object.keys(req.body)
        const commonNetworks = this.getCommonNetworks(networks, bodyNetworks)

        await BluebirbPromise.map(commonNetworks, async (networkIndex) => {
            const networkId = CoinTypeIndex[networkIndex]
            const addresses: string[] = req.body[networkIndex]
            const url = `${Nodes[networkId]}tokens`

            await BluebirbPromise.map(addresses, async (address) => {
                const tokens: any = await this.getAddressTokens({url, params: {address: address.toLowerCase()}})
                if (Array.isArray(tokens)) {
                    tokens.forEach(token => {
                        token.contract.coin = parseInt(networkIndex)
                        token.contract.type = "ERC20"
                        json.docs.push(token)
                    })
                }
            })
        })

       res.json(json)
    }

    public getTokensList = async (req, res) => {
        const tokens = {docs: []}
        const query: string = req.query.query
        const networks = req.query.networks
        const queryNetworks: string[] = networks ? networks.split(",") : networks

        if (!query || !queryNetworks) {
            return res.json(tokens)
        }

        const queryNetworksId = queryNetworks.map(net => CoinTypeIndex[net])
        const commonNetworks = this.getCommonNetworks(queryNetworksId, Object.keys(CoinTypeIndex))

        await BluebirbPromise.map(commonNetworks, async (network) => {
            const url: string = `${Nodes[network]}${Endpoints.TokenList}`
            const networkTokenList = await this.getAddressTokens({url, params: {query}})

            if (Array.isArray(networkTokenList)) {
                networkTokenList.forEach(token => {
                    token.coin = parseInt(CoinTypeIndex[network])
                    token.type = "ERC20"
                    tokens.docs.push(token)
                });
            }
        })

        res.json(tokens)
    }

    public getCommonNetworks = (arr1: string[], arr2: string[]): string[] => {
        return [arr1, arr2].shift().filter(v => [arr1, arr2].every(a => a.indexOf(v) !== -1))
    }

    public getAssets = async (req, res) => {
        const url = `${Nodes.ethereum}${req.url.slice(1)}`
        res.redirect(url)
    }

    public getAddressTokens({url, params}) {
        return axios({url, params}).then(res => res.data.docs ? res.data.docs : res.data)
    }

    private getRedirectUrl = (req, network?) => {
        const networkId: string = network ? network : req.params.networkId
        return `${Nodes[networkId]}${req.url.slice(this.queryIndex(req.url) + 1)}`
    }

    private queryIndex = (string) => string.indexOf("/", string.indexOf("/") + 1)
}