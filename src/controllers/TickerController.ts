import * as _ from "lodash"
import * as winston from "winston"
import { Request, Response } from "express"

import { sendJSONresponse } from "../common/Utils"
import { CurrencyCoefficient } from "../models/Currency/CurrencyCoefficientModel"
import { TickerModel } from "../models/Currency/TickerModel"

import { Ticker, Currencies } from "./Interfaces/Ticker"
import { ICoefficient } from "./Interfaces/ITokenPriceController"

export class Tickers {
    private tickers: Ticker[] = []
    private coefficients: {[key: string]: number} = {}
    private defaultPageNumber: number = 1
    private defaultPegeSize: number = 50
    private mappedTickersById: {[key: string]: Ticker} = {}
    private mappedtickersByRank: {[key: string]: Ticker} = {}

    public getTickers = async (req: Request, res: Response) => {
        try {
            const query = req.query,
                  currency = query.currency ? query.currency : Currencies.USD,
                  ids = query.ids,
                  page_number = query.page_number ? parseInt(query.page_number) : this.defaultPageNumber,
                  page_size = query.page_size ? parseInt(query.page_size) : this.defaultPegeSize

            let coefficient = 1

            if (this.tickers.length == 0) {
              await this.loadTickers()
              await this.loadCoefficients()
              this.mapTickersById()
              this.mapTickersByRank()
            }

            if (this.coefficients.hasOwnProperty(currency)) {
                coefficient = this.coefficients[currency]
            }

            if (ids) {
                const idsContainer: Ticker[] = []
                const idsArray: string[] = ids.split(",")
                idsArray.forEach(id => {
                    if (this.mappedTickersById.hasOwnProperty(id)) {
                        idsContainer.push(_.cloneDeep(this.mappedTickersById[id]))
                    }
                })

                const convertedToCurrency = idsContainer.map((ticker: Ticker) => this.convertToCurrency(ticker, coefficient))

                return sendJSONresponse(res, 200, {
                    status: true,
                    currency,
                    docs: convertedToCurrency
                })
            }
            const paginateTickers: Ticker[] = this.paginate(page_number, page_size)
            const finalTicker = paginateTickers.map((ticker: Ticker) => this.convertToCurrency(ticker, coefficient))

            sendJSONresponse(res, 200, {
                status: true,
                currency,
                docs: finalTicker,
            })
        } catch (error) {
            sendJSONresponse(res, 500, {
                status: false,
                error
            })
        }

    }

    public paginate = (page_number: number, page_size: number): Ticker[] => {
        const paginated = []
        --page_number
        for (let i = page_number * page_size + 1; i <= (page_number + 1) * page_size; i++) {
            if (this.mappedtickersByRank.hasOwnProperty(i)) {
                const ticker = _.cloneDeep(this.mappedtickersByRank[i])
                paginated.push(ticker)
            }
        }
        return paginated
      }

    public convertToCurrency = (ticker: Ticker, coefficient: number): Ticker => {
        console.log({coefficient})
        ticker.market_cap = ticker.market_cap / coefficient
        ticker.volume_24h = ticker.volume_24h / coefficient
        ticker.price = ticker.price / coefficient
        ticker.total_supply = ticker.total_supply / coefficient
        ticker.circulating_supply = ticker.circulating_supply / coefficient
        return ticker
    }

    // public slipIdToHex(coinSlip44Index: number): string {
    //     const hexString: string = coinSlip44Index.toString(16)
    //     const id: string = `0`.repeat(40 - hexString.length)
    //     return `0x${id}${hexString}`
    // }

    public loadTickers = async () => {
        try {
            this.tickers = await TickerModel.find({}).select("-_id")
        } catch (error) {
            winston.error(`Failed to load tickers from DB`, error)
        }
    }

    public loadCoefficients = async () => {
        try {
            const coefficietns: ICoefficient[] = await CurrencyCoefficient.find({})

            coefficietns.forEach(coef => {
                this.coefficients[coef.currency] = coef.coefficient
            })
        } catch (error) {
            winston.error(`Failed to load coefficients from DB`, error)
        }
    }

    public mapTickersById = () => {
        this.tickers.map(ticker => {
            this.mappedTickersById[ticker.id] = _.cloneDeep(ticker)
        })
    }

    public mapTickersByRank = () => {
        for (const key in this.mappedTickersById) {
            if (this.mappedTickersById.hasOwnProperty(key)) {
                const ticker = _.cloneDeep(this.mappedTickersById[key])
                this.mappedtickersByRank[ticker.rank] = ticker
            }
        }
    }

}