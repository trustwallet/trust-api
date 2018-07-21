import { Nodes, CoinTypeIndex } from "../controllers/Interfaces/Servers"
import * as BluebirbPromise from "bluebird";
import axios from "axios";
export class Redirect {

    public redirect = (req, res) => {
        const url = this.getRedirectUrl(req)
        res.redirect(url)
    }

    public listTokens = async (req, res) => {
        const json = {docs: []}
        const networks = Object.keys(Nodes)

        await BluebirbPromise.map(networks, async (networkId) => {
            for (const coinIndex in req.body) {
                const addresses: string[] = req.body[coinIndex]
                const url = `${Nodes[networkId]}tokens`

                await BluebirbPromise.map(addresses, async (address) => {
                    const tokens = await this.getAddressTokens(url, address.toLowerCase())
                    if (Array.isArray(tokens)) {
                        tokens.forEach(token => {
                            json.docs.push(Object.assign(token.contract, {coin: CoinTypeIndex[networkId]}, {type: "ERC20"}))
                        })
                    }
                })
            }
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

    private getRedirectUrl = (req) => {
        console.log(req.params)
        const networkId: string = req.params.networkId
        return `${Nodes[networkId]}${req.url.slice(this.queryIndex(req.url) + 1)}`
    }

    private queryIndex = (string) => string.indexOf("/", string.indexOf("/") + 1)
}