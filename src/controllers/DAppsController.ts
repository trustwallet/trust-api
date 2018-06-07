import { Request, Response } from "express";
import { DApp } from "../models/DAppModel";
import { DAppCategory } from "../models/DAppCategory";
import * as xss from "xss-filters";
import { sendJSONresponse } from "../common/Utils";
import axios from "axios";
const config = require("config");
const _uniqBy = require("lodash.uniqby");

export class DAppsController {

    public byCategoryID(req: Request, res: Response) {
        const validationErrors: any = DAppsController.validateQueryParameters(req);
        if (validationErrors) {
            sendJSONresponse(res, 400, validationErrors);
            return;
        }
        const queryParams = DAppsController.extractQueryParameters(req);
        const network = parseInt(req.query.network) || 1

        Promise.all([
            DAppCategory.findOne({_id: req.params.id}),
            DAppsController.list({category: req.params.id, networks: {$in: [network]}}, {limit: 30, sort: {createdAt: -1}})
        ]).then( (values) => {
            sendJSONresponse(res, 200, {
                category: values[0],
                docs: values[1].docs,
            })
        }).catch((err: Error) => {
            sendJSONresponse(res, 404, err);
        });
    }

    public static list(query: any, options: any = {}): Promise<any> {
        return DApp.paginate({...query, enabled: true}, {
            populate: {
                path: "category",
                model: "DAppCategory"
            },
            ...options,
        })
    }

    public main(req: Request, res: Response) {
        const validationErrors: any = DAppsController.validateQueryParameters(req);
        if (validationErrors) {
            sendJSONresponse(res, 400, validationErrors);
            return;
        }
        const queryParams = DAppsController.extractQueryParameters(req);
        const network = parseInt(req.query.network) || 1

        DAppCategory.find({}).sort({order: 1}).then((results: any) => {
            let promises = results.map((category: any) => {
                return DAppsController.getCategoryElements(category, network)
            })
            return Promise.all(promises).then((results) => {
                const filtered = results.filter((item: any) => {
                    return item.results.length > 0
                });
                sendJSONresponse(res, 200, {docs: filtered})
            })
        }).catch((err: Error) => {
            sendJSONresponse(res, 404, err);
        });
    }

    public static getCategoryElements(category: any, network: number): Promise<any> {
        return DAppsController.list({category, $or:[
            {networks: { $in: [network]}},
            {networks: []}, 
        ] }, {sort: {createdAt: -1}, limit: category.limit}).then((results: any) => {
            return Promise.resolve({category, results: results.docs})
        }).catch((error: Error) => {
            return Promise.reject(error)
        })
    }

    private static validateQueryParameters(req: Request) {
        req.checkQuery("page", "Page needs to be a number").optional().isNumeric();
        req.checkQuery("limit", "limit needs to be a number").optional( ).isNumeric();
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