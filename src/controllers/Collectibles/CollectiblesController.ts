import * as BluebirbPromise from "bluebird"
import axios from "axios"

import { Nodes, CoinTypeIndex, Endpoints, ERCStandarts } from "../../controllers/Interfaces/Servers"
import { Request, Response } from "express"


export class Collectibles {
    public getCollectibles = async (req: Request, res: Response) => {
        try {
            const json = {docs: []}
            const supportedNetworks = Object.keys(CoinTypeIndex)
            const bodyNetworks = Object.keys(req.body)
            const commonNetworks = this.getCommonNetworks(supportedNetworks, bodyNetworks)

            await BluebirbPromise.map(commonNetworks, async (networkIndex) => {
                const networkId: string = CoinTypeIndex[networkIndex]
                const addresses: string[] = req.body[networkIndex]
                const url: string = `${Nodes[networkId]}${Endpoints.Collectibles}`

                await BluebirbPromise.map(addresses, async (address) => {
                    const collectibles: any = await this.getAddressCollectibles({url, params: {address: address.toLowerCase()}})
                    if (Array.isArray(collectibles)) {
                        collectibles.forEach(collectible => {
                            json.docs.push(Object.assign(collectible, {
                                coin: parseInt(networkIndex),
                                type: ERCStandarts.ERC721
                            }))
                        })
                    }
                })
            })
            this.sendJSONresponse(res, 200, json)
        } catch (error) {
            this.sendJSONresponse(res, 400, {error: "Error getting collectibles"})
        }

    }

    public getCommonNetworks = (arr1: string[], arr2: string[]): string[] => {
        return [arr1, arr2].shift().filter(v => [arr1, arr2].every(a => a.indexOf(v) !== -1))
    }

    public getAddressCollectibles = (args) => {
        const {url, params } = args
        console.log({url})
        console.log({params})
        return axios({url, params}).then(res => res.data.docs ? res.data.docs : res.data)
    }

    private sendJSONresponse(res: Response, status: number, content: any) {
        return res.status(status).json(content)
    }
}