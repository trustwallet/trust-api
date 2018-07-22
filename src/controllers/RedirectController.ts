import { Nodes, CoinTypeIndex } from "../controllers/Interfaces/Servers"
import * as BluebirbPromise from "bluebird";
import axios from "axios";
import { concatSeries } from "../../node_modules/@types/async";
export class Redirect {

    public redirect = (req, res) => {
        const url = this.getRedirectUrl(req)
        res.redirect(url)
    }

    public listTokens = async (req, res) => {
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
                const tokens = await this.getAddressTokens(url, address.toLowerCase())
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

    public getAddressTokens(url: string, address: string) {
        return axios({
            url,
            params: {
                address
            }
        }).then(res => res.data.docs)
    }

    private getRedirectUrl = (req, network?) => {
        const networkId: string = network ? network : req.params.networkId
        return `${Nodes[networkId]}${req.url.slice(this.queryIndex(req.url) + 1)}`
    }

    private queryIndex = (string) => string.indexOf("/", string.indexOf("/") + 1)
}