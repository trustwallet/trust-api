import { Request, Response } from "express";
import { sendJSONresponse } from "../common/Utils";

export class AppCheck {
    public android(req: Request, res: Response) {
        sendJSONresponse(res, 200, {
            "latestVersion": "1.5.111",
            "latestVersionCode": 228,
            "url": "https://s3-us-east-2.amazonaws.com/trustandroidapk/bitrise_e6a70d2c429f5842/latest_build/app-debug-bitrise-signed.apk",
            "releaseNotes": [
                    "- Bug fixes"
                ]
            }
        )
    }
}