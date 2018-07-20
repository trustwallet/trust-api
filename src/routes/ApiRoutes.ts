import  * as express from "express";
import { DAppsController } from "../controllers/DAppsController";
import { TokenPriceController } from "../controllers/TokenPriceController";
import { AppCheck } from "../controllers/AppCheck";
import { TokenInfo } from "../controllers/TokenInfo";
import { Nodes, Routes, Networks } from "../controllers/Interfaces/Servers"
const router = express.Router();
import url = require("url");

const dAppsController = new DAppsController();
const priceController = new TokenPriceController();
const appCheck = new AppCheck();
const tokenInfo = new TokenInfo();

router.get("/dapps/main", dAppsController.main);
router.get("/dapps/category/:id", dAppsController.byCategoryID);
router.post("/tokenPrices", priceController.getTokenPrices);
router.get("/appcheck/android", appCheck.android);
// Token info
router.get("/tokeninfo/:networkid/:address?", tokenInfo.getTokenInfo);

// Ethereum routes
router.get(`/ethereum/transactions`, (req, res) => {
    const redirectUrl = url.format({
        pathname: `${Nodes.Localhost}${Routes.Transactions}`,
        query: req.query
    })
    res.redirect(redirectUrl)
})

export {
    router
};