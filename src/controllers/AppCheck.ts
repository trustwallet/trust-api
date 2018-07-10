import { Request, Response } from "express";
import { sendJSONresponse } from "../common/Utils";

export class AppCheck {
    public android(req: Request, res: Response) {
        sendJSONresponse(res, 200, {
            "latestVersion": "1.5.131",
            "latestVersionCode": 254,
            "url": "https://s3-us-east-2.amazonaws.com/trustandroidapk/builds/latest_release.apk",
            "releaseNotes": [
                    "- Improved token UI - clicking on token shows transactions for that token",
                    "- Amount validation",
                    "- Descriptions on import fields",
                    "- Show identicon in wallet list",
                    "- Fixes: collectible still being show after transfer"
                ]
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
            "description": "A new version of Trust Wallet is available. Please Update to version " + version,
            "force": false
            },
        )
    }
}
