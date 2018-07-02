import { Request, Response } from "express"
import { sendJSONresponse } from "../common/Utils"
import * as winston from "winston";
import Axios from "axios";
import { validationResult } from "express-validator/check"
import { ITokenInfo } from "./Interfaces/ITokenInfo";

export class TokenInfo {
    private tokensInfo: {[key: string]: {[key: string]: ITokenInfo[]}} = {}
    private supportedNetworks: string[] = ["etc", "eth", "kov", "rin", "rop"]

    public getTokenInfo = async (req: Request, res: Response) => {
        try {
            const validationErrors = this.validateQueryParameters(req)
            if (validationErrors) {
                sendJSONresponse(res, 400, validationErrors)
                return
            }
            const wallets = req.body.wallets
            const network = req.body.network

            if (!this.tokensInfo.hasOwnProperty(network)) {
                await this.getTokens(network)
            }

            const tokensInfos = wallets.map(w => this.tokensInfo[network][w]).filter(w => w)

            sendJSONresponse(res, 200, {
                status: true,
                response: tokensInfos
            })
        } catch (error) {
            sendJSONresponse(res, 500, {
                status: true,
                error
            })
        }
    }

    public getTokens = (network: string) => {
        try {
            return new Promise(async (resolve) => {
                const tokens = await Axios.get(`https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/tokens/tokens-${network}.json`)

                const networkTokens = tokens.data.reduce((acc, val) => {
                    const tokenObj: {[key: string]: ITokenInfo} = {}
                    tokenObj[val.address.toLowerCase()] = val
                    Object.assign(acc, tokenObj)
                    return acc
                }, {})
                Object.assign(this.tokensInfo, {[network]: networkTokens})
                winston.info(`Tokens info loaded`)
                resolve()
            })
        } catch (error) {
            winston.info(`Error fetching tokens`, error)
            Promise.reject(error)
        }
    }

    private validateQueryParameters(req: Request) {
        req.checkBody("network", "Must be 3 characters long").isLength({max: 3, min: 3})
        req.checkBody("network", `Suppoted networks ${this.supportedNetworks}`).isIn(this.supportedNetworks)

        return req.validationErrors();
    }
}