import { Request, Response } from "express";
import { DApp } from "../models/DAppModel";
import * as xss from "xss-filters";
import { sendJSONresponse } from "../common/Utils";
import axios from "axios";
const config = require("config");
const _uniqBy = require("lodash.uniqby");

const DAppCategory = require("../models/DAppCategory");

export class DAppsController {

    public readAll(req: Request, res: Response) {

        const validationErrors: any = DAppsController.validateQueryParameters(req);
        if (validationErrors) {
            sendJSONresponse(res, 400, validationErrors);
            return;
        }
        const queryParams = DAppsController.extractQueryParameters(req);

        DApp.paginate({}, {
            populate: {
                path: "category",
                model: "DAppCategory"
            }
        }).then((items: any) => {
            sendJSONresponse(res, 200, items);
        }).catch((err: Error) => {
            sendJSONresponse(res, 404, err);
        });
    }

    private static validateQueryParameters(req: Request) {
        req.checkQuery("page", "Page needs to be a number").optional().isNumeric();
        req.checkQuery("limit", "limit needs to be a number").optional().isNumeric();
        //req.checkQuery("address", "address needs to be alphanumeric").isAlphanumeric();

        return req.validationErrors();
    }

    private static extractQueryParameters(req: Request) {
        // page parameter
        let page = parseInt(xss.inHTMLData(req.query.page));
        if (isNaN(page) || page < 1) {
            page = 1;
        }

        // limit parameter
        let limit = parseInt(xss.inHTMLData(req.query.limit));
        if (isNaN(limit)) {
            limit = 50;
        } else if (limit > 500) {
            limit = 500;
        } else if (limit < 1) {
            limit = 1;
        }

        // address parameter
        const address = xss.inHTMLData(req.query.address);

        return {
            address: address,
            page: page,
            limit: limit
        };
    }
}