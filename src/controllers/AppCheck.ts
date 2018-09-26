import { Request, Response } from "express";
import { sendJSONresponse } from "../common/Utils";

export class AppCheck {
    public android(req: Request, res: Response) {
        const version = "1.6.140"
        const build = 315
        sendJSONresponse(res, 200, {
            "latestVersion": version,
            "latestVersionCode": build,
            "url": "https://files.trustwalletapp.com/builds/latest_release.apk",
            "releaseNotes": [
                    "- Support for VeChain and Wanchain",
                    "- Bugs fixes and perfomance improvements",
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
