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
}
