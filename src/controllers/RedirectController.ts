import url = require("url");
import { Nodes, CoinTypes } from "../controllers/Interfaces/Servers"
import * as BluebirbPromise from "bluebird";
import axios from "axios";
export class Redirect {

    public redirect = (req, res) => {
        const url = this.getRedirectUrl(req)
        res.redirect(url)
    }

    public listTokens = async (req, res) => {
        const json = {docs: []}

        for (const coinIndex in req.body) {
           const addresses: string[] = req.body[coinIndex]
           const coinName = CoinTypes[parseInt(coinIndex)]
           const url = `${Nodes[coinName]}tokens`

           await BluebirbPromise.map(addresses, async (address) => {
                const tokens = await this.getTokens(url, address)
                tokens.forEach(token => {
                    json.docs.push(Object.assign(token, {coin: coinIndex}, {type: "ERC20"}))
                });
           })
       }

       res.json(json)
    }

    public getTokens(url: string, address: string) {
        return axios({
            url,
            params: {
                address
            }
        }).then(res => res.data.docs)
    }

    private getRedirectUrl = (req) => {
        const networkId = req.path.substring(1, this.queryIndex(req.path))
        return `${Nodes[networkId]}${req.url.slice(this.queryIndex(req.url) + 1)}`
    }

    private queryIndex = (string) => string.indexOf("/", string.indexOf("/") + 1)
}