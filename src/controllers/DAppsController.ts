import { Request, Response } from "express";
import { DApp } from "../models/DAppModel";
import * as xss from "xss-filters";
import axios from "axios";
const config = require("config");
const _uniqBy = require("lodash.uniqby");

export class DAppsController {

    public readAll(req: Request, res: Response) {

        // validate query input
        // const validationErrors: any = TokenController.validateQueryParameters(req);
        // if (validationErrors) {
        //     sendJSONresponse(res, 400, validationErrors);
        //     return;
        // }

        // // extract query parameters
        // const queryParams = TokenController.extractQueryParameters(req);
        // const address = queryParams.address.toLowerCase();
        // const query: any = {
        //     address: address
        // };

        // TokenController.getRemoteTokens(address).then((tokens: any) => {
        //     if (tokens) {
        //         sendJSONresponse(res, 200, {
        //             docs: tokens
        //         });
        //     } else {
        //         sendJSONresponse(res, 404, "Balances for tokens could not be found.");
        //     }
        // });
    }

    private static validateQueryParameters(req: Request) {
        req.checkQuery("page", "Page needs to be a number").optional().isNumeric();
        req.checkQuery("limit", "limit needs to be a number").optional().isNumeric();
        req.checkQuery("address", "address needs to be alphanumeric").isAlphanumeric();

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