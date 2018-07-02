import { Request, Response } from "express"
import { tokeninfo } from "../common/tokens/tokeninfo"
import { sendJSONresponse } from "../common/Utils"

export class TokenInfo {
    private tokens = tokeninfo.reduce((acc, val) => {
        const tokenObj: {[key: string]: any} = {}
        tokenObj[val.address.toLowerCase()] = val
        Object.assign(acc, tokenObj)
        return acc
    }, {})

    public getTokenInfo = (req: Request, res: Response) => {
        const wallets = req.body.wallets

        const tokensInfos = wallets.map(wallet => {
            if (this.tokens.hasOwnProperty(wallet)) {
                return this.tokens[wallet]
            }
        })

        sendJSONresponse(res, 200, {
            statis: true,
            response: tokensInfos
        })
    }
}