import  * as express from "express";
import { DAppsController } from "../controllers/DAppsController";
import { TokenPriceController } from "../controllers/TokenPriceController";
const router = express.Router();

const dAppsController = new DAppsController();
const priceController = new TokenPriceController();

router.get("/dapps/main", dAppsController.main);
router.get("/dapps/category/:id", dAppsController.byCategoryID);
router.post("/tokenPrices", priceController.getTokenPrices);

export {
    router
};