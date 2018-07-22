import  * as express from "express";
import { DAppsController } from "../controllers/DAppsController";
import { TokenPriceController } from "../controllers/TokenPriceController";
import { AppCheck } from "../controllers/AppCheck";
import { TokenInfo } from "../controllers/TokenInfo";
import { Redirect } from "../controllers/RedirectController";
const router = express.Router();

const dAppsController = new DAppsController();
const priceController = new TokenPriceController();
const appCheck = new AppCheck();
const tokenInfo = new TokenInfo();
const redirect = new Redirect()

router.get("/dapps/main", dAppsController.main);
router.get("/dapps/category/:id", dAppsController.byCategoryID);
router.post("/tokenPrices", priceController.getTokenPrices);
router.get("/appcheck/android", appCheck.android);
// Token info
router.get("/tokeninfo/:networkid/:address?", tokenInfo.getTokenInfo);
   // Redirect routes
// Ethereum
router.get(`/:networkId/transactions`, redirect.redirect)
router.get(`/:networkId/transactions/:transactionId`, redirect.redirect)
router.get(`/:networkId/tokens/list`, redirect.redirect)
router.post(`/tokens`, redirect.listTokens)
router.get(`/assets`, redirect.getAssets)

export {
    router
};