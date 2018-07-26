import { App } from "../src/App";
const chai = require("chai")
const app = new App().app
const chaiHttp = require("chai-http")
chai.use(chaiHttp)

describe("Docs", () => {
    it("Docs shoud response with status 200", () => {
        chai.request(app)
            .get("/docs")
            .end((err, res) => {
                res.should.have.status(200)
            })
    });
})