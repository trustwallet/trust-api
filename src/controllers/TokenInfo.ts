import { Request, Response } from "express"
import { sendJSONresponse } from "../common/Utils"
import * as winston from "winston";
import Axios from "axios";

import { ITokenInfo } from "./Interfaces/ITokenInfo";

export class TokenInfo {
    private tokenInfo: ITokenInfo[] = []

    constructor() {
        this.getTokens()
    }

    public getTokenInfo = (req: Request, res: Response) => {
        const wallets = req.body.wallets

        const tokensInfos = wallets.map(wallet => {
            if (this.tokenInfo.hasOwnProperty(wallet)) {
                return this.tokenInfo[wallet]
            }
        }).filter(w => w)

        sendJSONresponse(res, 200, {
            statis: true,
            response: tokensInfos
        })
    }

    public getTokens = async () => {
        try {
            const tokens = await Axios.get("https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/tokens/tokens-eth.json")
            this.tokenInfo = tokens.data.reduce((acc, val) => {
                const tokenObj: {[key: string]: ITokenInfo} = {}
                tokenObj[val.address.toLowerCase()] = val
                Object.assign(acc, tokenObj)
                return acc
            }, {})
        } catch (error) {
            winston.info(`Error fetching tokens`, error)
        }
    }
}