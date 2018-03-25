import  * as express from "express";
import { DAppsController } from "../controllers/DAppsController";
const router = express.Router();

const dAppsController = new DAppsController();

// URLs for tokens
router.get("/dapps", dAppsController.readAll);

export {
    router
};