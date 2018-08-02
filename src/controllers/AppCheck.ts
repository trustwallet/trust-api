import { Request, Response } from "express";
import { sendJSONresponse } from "../common/Utils";

export class AppCheck {
    public android(req: Request, res: Response) {
        const version = 1.6.109"
        const build = 282
        sendJSONresponse(res, 200, {
            "latestVersion": version,
            "latestVersionCode": build,
            "url": "https://files.trustwalletapp.com/builds/latest_release.apk",
            "releaseNotes": [
                    "- Introducing Multi-Coin Wallet to store (ETH, ETC, POA) and all ERC20 tokens",
                    "- Accelerated the load of prices for coins and tokens.",
                    "- Wallet naming",
                    "- Export mnemonic phrase",
                    "- Push notifications",
                    "- Improved token UI - clicking on token shows transactions for that token",
            ],
            "title": "Update Available",
            "description": "A new version of Trust Wallet is available. Please update to version " + version,
            "force": false
            }
        )
    }

    public ios(req: Request, res: Response) {
        const version = "1.66.0"
        const build = 252
        sendJSONresponse(res, 200, {
            "latestVersion": version,
            "latestVersionCode": build,
            "url": "https://itunes.apple.com/us/app/trust-ethereum-wallet/id1288339409?mt=8",
            "title": "Update Available",
            "description": "A new version of Trust Wallet is available. Please update to version " + version,
            "force": false
            },
        )
    }
}
