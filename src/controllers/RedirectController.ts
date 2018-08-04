import { Nodes, CoinTypeIndex, Endpoints } from "../controllers/Interfaces/Servers"
import { Request, Response } from "express";
import * as BluebirbPromise from "bluebird";
import axios from "axios";
import * as qs from "qs";

export class Redirect {

    public getTransactions = async (req: Request, res: Response) => {
        const json = {docs: []}
        const networkId = req.params.networkId
        const query = this.createQuery(req.query)
        const url = `${Nodes[networkId]}${Endpoints.Transactions}${query}`
        const transactions = await this.getAddressTokens({url})

        if (Array.isArray(transactions)) {
            transactions.forEach(transaction => {
                transaction.coin = CoinTypeIndex[networkId]
                json.docs.push(transaction)
            })
            return res.json(json)
        }
        res.json(json)
    }

    public getAddressAllTokens = async (req, res) => {
        const json = {docs: []}
        const networks = Object.keys(CoinTypeIndex)
        const bodyNetworks = Object.keys(req.body)
        const commonNetworks = this.getCommonNetworks(networks, bodyNetworks)

        await BluebirbPromise.map(commonNetworks, async (networkIndex) => {
            const networkId = CoinTypeIndex[networkIndex]
            const addresses: string[] = req.body[networkIndex]
            const url = `${Nodes[networkId]}${Endpoints.Tokens}`

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
        const { query, networks, verified = true } = req.query
        const queryNetworks: string[] = networks ? networks.split(",") : networks

        if (!query || !queryNetworks) {
            return res.json(tokens)
        }

        const queryNetworksId = queryNetworks.map(net => CoinTypeIndex[net])
        const commonNetworks = this.getCommonNetworks(queryNetworksId, Object.keys(CoinTypeIndex))

        await BluebirbPromise.map(commonNetworks, async (network) => {
            const url: string = `${Nodes[network]}${Endpoints.TokensList}`
            const networkTokenList = await this.getAddressTokens({url, params: {query, verified}})

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

    public register = async (req: Request, res: Response) => {
        const registrResults = []
        const {deviceID, token, type} = req.body
        const networks = Object.keys(req.body.networks)
        const commonNetworks = this.getCommonNetworks(networks, Object.keys(CoinTypeIndex))

        try {
           await BluebirbPromise.map(commonNetworks, async (network) => {
                const url = `${Nodes[CoinTypeIndex[network]]}${Endpoints.RegisterDevice}`
                const wallets = req.body.networks[network]
                const data = { deviceID, token, type, wallets }
                const registered = await axios.post(url, data).then(res => res.data)
                registrResults.push(registered)
           })

           this.sendJSONresponse(res, 200, registrResults)
        } catch (error) {
            console.error(`Error registering device`, error)
            this.sendJSONresponse(res, 400, {error: "Error regestering device"})
        }

    }

    public unregister = async (req: Request, res: Response) => {
        const unregisterResults = []
        const {deviceID, token, networks, type} = req.body
        const networksToUnregister = this.getSupportedCoinIndex()

        try {
            await BluebirbPromise.map(networksToUnregister, async (networkIndex) => {
                const coin = CoinTypeIndex[networkIndex]
                const url = `${Nodes[coin]}${Endpoints.UnegisterDevice}`
                const data = {deviceID, token, networks, type}
                const unregistered = await axios.post(url, data).then(res => res.data)
                unregisterResults.push(unregistered)
            })

            this.sendJSONresponse(res, 200, unregisterResults)
        } catch (error) {
            console.error(`Error registering device`, error)
            this.sendJSONresponse(res, 500, {error: error.toString()})
        }
    }

    private getSupportedCoinIndex () {
        const keys = Object.keys(CoinTypeIndex).filter(k => typeof CoinTypeIndex[k as any] === "number")
        const values = keys.map(k => CoinTypeIndex[k as any])
        return values;
    }

    private sendJSONresponse(res: Response, status: number, content: any) {
        return res.status(status).json(content)
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

}