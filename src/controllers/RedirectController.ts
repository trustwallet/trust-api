import { Nodes, CoinTypeIndex, Endpoints } from "../controllers/Interfaces/Servers"
import * as BluebirbPromise from "bluebird";
import axios from "axios";
import { concatSeries } from "../../node_modules/@types/async";
export class Redirect {

    public redirect = (req, res) => {
        const url = this.getRedirectUrl(req)
        res.redirect(url)
    }

    public getAddressAllTokens = async (req, res) => {
        const json = {docs: []}
        const networks = Object.keys(CoinTypeIndex)
        const bodyNetworks = Object.keys(req.body)
        const commonNetworks = [networks, bodyNetworks].shift().filter((v) => {
            return [networks, bodyNetworks].every((a) => a.indexOf(v) !== -1);
        });

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
        const query = req.query.query
        const networks = Object.keys(Nodes)

        await BluebirbPromise.map(networks, async (network) => {
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

    public getAssets = async (req, res) => {
        const url = `${Nodes["ethereum"]}${req.url.slice(1)}`
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