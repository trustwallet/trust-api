import { Request, Response } from "express"
import { sendJSONresponse } from "../common/Utils"
import { CurrencyCoefficient } from "../models/Currency/CurrencyCoefficientModel";
import { Ticker } from "../models/Currency/TickerModel";
import { contracts } from "../common/tokens/contracts"
import * as winston from "winston"
// Interfaces
import { TickerI } from "./Interfaces/Ticker"
import { ICoefficient } from "./Interfaces/ITokenPriceController"
import { } from "./Interfaces/ITokenPriceController"


export class Tickers {
    private tickers: TickerI[] = []
    private coefficients: {[key: string]: number} = {}

    public getTickers = async (req: Request, res: Response) => {
        try {
            const { currency } = req.params
            let coefficient = 1

            if (this.tickers.length == 0) {
              await this.loadTickers()
              await this.loadCoefficients()
            }

            if (this.coefficients.hasOwnProperty(currency)) {
                coefficient = this.coefficients[currency]
            }
            console.log(this.coefficients)

            const tikerss = this.tickers.map((ticker: TickerI) => {
                return Object.assign(ticker, {
                    market_cap: ticker.market_cap / coefficient,
                    volume_24h: ticker.volume_24h / coefficient,
                    price: ticker.price / coefficient,
                    total_supply: ticker.total_supply / coefficient,
                    circulating_supply: ticker.circulating_supply / coefficient
                })
            })

            sendJSONresponse(res, 200, {
                status: true,
                currency,
                docs: tikerss
            })
        } catch (error) {
            sendJSONresponse(res, 500, {
                status: false,
                error
            })
        }

    }

    // public slipIdToHex(coinSlip44Index: number): string {
    //     const hexString: string = coinSlip44Index.toString(16)
    //     const id: string = `0`.repeat(40 - hexString.length)
    //     return `0x${id}${hexString}`
    // }

    public async loadTickers() {
        try {
            const tickers = await Ticker.find({}).select("-_id")
            this.tickers = tickers
        } catch (error) {
            winston.error(`Failed to load tickers from DB`, error)
        }
    }

    public async loadCoefficients() {
        try {
            const coefficietns: ICoefficient[] = await CurrencyCoefficient.find({})

            coefficietns.forEach(coef => {
                this.coefficients[coef.currency] = coef.coefficient
            })
        } catch (error) {
            winston.error(`Failed to load coefficients from DB`, error)
        }
    }

}