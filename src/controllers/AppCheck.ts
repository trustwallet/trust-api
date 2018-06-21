import { Request, Response } from "express";
import { sendJSONresponse } from "../common/Utils";

export class AppCheck {
    public android(req: Request, res: Response) {
        sendJSONresponse(res, 200, {
            "latestVersion": "1.5.125",
            "latestVersionCode": 247,
            "url": "https://s3-us-east-2.amazonaws.com/trustandroidapk/builds/latest_release.apk",
            "releaseNotes": [
                    "- Bug fixes"
                ]
            }
        )
    }
}
