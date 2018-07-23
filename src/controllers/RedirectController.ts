import { Nodes, CoinTypeIndex, Endpoints } from "../controllers/Interfaces/Servers"
import { Request, Response } from "express";
import * as BluebirbPromise from "bluebird";
import axios from "axios";
import * as qs from "qs";

export class Redirect {

    public getTransactionById = async (req: Request, res: Response) => {
        const networkId = req.params.networkId
        const transactionId = req.params.transactionId
        const url = `${Nodes[networkId]}${Endpoints.TransactionId}${transactionId}`

        try {
            const transaction = await this.getAddressTokens({url})
            if (typeof transaction === "object") {
                transaction.coin = CoinTypeIndex[networkId]
                return res.json(transaction)
            }
        } catch (error) {
            const status = error.response.status
            return res.status(status).json({error: "error"})
        }

    }

    public getTransactions = async (req: Request, res: Response) => {
        const networkId = req.params.networkId
        const query = this.createQuery(req.query)
        const url = `${Nodes[networkId]}${Endpoints.Transactions}${query}`
        const transactions = await this.getAddressTokens({url})

        if (Array.isArray(transactions)) {
            transactions.forEach(trx => {
                trx.coin = CoinTypeIndex[networkId]
            })
            return res.json(transactions)
        }
        res.json([])
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
            const url: string = `${Nodes[network]}${Endpoints.TokensList}`
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

    public getAssets = (req: Request, res: Response) => {
        const query = this.createQuery(req.query)
        const url = `${Nodes.ethereum}${Endpoints.Assets}${query}`
        res.redirect(url)
    }

    public createQuery = (query: any): string => {
        return query ? `?${qs.stringify(query)}` : ``
    }

    public getAddressTokens(args) {
        const {url, params } = args
        return axios({url, params}).then(res => res.data.docs ? res.data.docs : res.data)
    }

    private getRedirectUrl = (req, network?) => {
        const networkId: string = network ? network : req.params.networkId
        return `${Nodes[networkId]}${req.url.slice(this.queryIndex(req.url) + 1)}`
    }

    private queryIndex = (string) => string.indexOf("/", string.indexOf("/") + 1)
}