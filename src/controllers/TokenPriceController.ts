import { Request, Response } from "express";
import { sendJSONresponse } from "../common/Utils";
import * as winston from "winston";
import * as BluebirbPromise from "bluebird";
import { IToken, IPrice, IPriceDB, ICoefficient } from "./Interfaces/ITokenPriceController";
import { Ticker } from "../models/TickerModel"
import { CurrencyCoefficient } from "../models/CurrencyCoefficientModel"
import { contracts } from "../common/tokens/contracts";
import { setDelay } from "../common/Utils"

const CoinMarketCap = require("coinmarketcap-api");

export class TokenPriceController {
    private client = new CoinMarketCap();
    private refreshLimit: number = 600 // seconds
    private updateFrequency = 300000 // milliseconds
    private lastestCoefficients: {[key: string]: number} = {}
    private coefficientUpdated = <{[key: string]: number}>{}
    private latestUSDPrices: IPriceDB[] = []
    private isUpdating: {[key: string]: boolean} = {}
    private githubImageURL: string = "https://raw.githubusercontent.com/TrustWallet/tokens/master/images/";

    constructor() {
        this.initialize()
    }

    getTokenPrices = (req: Request, res: Response) => {
        const supportedCurrency: string[] = ["AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR", "PLN", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "ZAR", "USD"]
        const currency: string = supportedCurrency.indexOf(req.body.currency.toUpperCase()) == -1 ? "USD" : req.body.currency.toUpperCase();
        const tokens = req.body.tokens;

        this.getPrices(currency).then((prices: any) => {
        sendJSONresponse(res, 200, {
            status: true,
            response: this.filterTokenPrices(prices, tokens),
        })
        })
        .catch((error: Error) => {
            winston.error(`Failed to get prices for ${currency}`, error)

            sendJSONresponse(res, 500, {
                status: 500,
                error,
            });
        });
    }

    private async initialize() {
        try {
            await this.loadUSDPrice()
            await this.loadCoefficientsFromDB()
            this.usdUpdater()
            this.coefficientUpdater()
        } catch (error) {
            winston.error(`Error initializing`, error)
        }
    }

    private async loadUSDPrice() {
        try {
            const usdPrices = await Ticker.find({})

            if (usdPrices.length > 0) {
                winston.info(`Getting price from db`)
                this.latestUSDPrices = usdPrices
                this.coefficientUpdated.USD = Date.now()
                return Promise.resolve()
            } else {
                winston.info(`No prices founded in DB, getting latest prices from CM`)
                await this.updateUSDPrices()
                return Promise.resolve()
            }
        } catch (error) {
            winston.error(`Error updating USD prices`, error)
            Promise.reject(error)
        }
    }

    private async loadCoefficientsFromDB() {
        try {
            winston.info(`Loading coefficients from DB`)

            const coefficietns: ICoefficient[] = await CurrencyCoefficient.find({})

            coefficietns.forEach(coef => {
                this.lastestCoefficients[coef.currency] = coef.coefficient
                this.coefficientUpdated[coef.currency] = Date.now()
            });
            winston.info(`Coefficients updated`)
            return Promise.resolve()
        } catch (error) {
            winston.info(`Error loading coefficients from DB`)
            Promise.reject(error)
        }
    }

    private async usdUpdater() {
        try {
            if (!this.isUSDUpdated()) {
                winston.info(`USD prices outdated, updating ...`)
                await this.updateUSDPrices()
                winston.info(`USD prices up to date`)
            }
            await setDelay(this.updateFrequency)
            this.usdUpdater()
        } catch (error) {
            winston.error(`Error checking is usd up to date, restartting in ${this.updateFrequency}`, error)
            await setDelay(5000)
        }
    }

    private async coefficientUpdater() {
        try {
            for (const currency in this.coefficientUpdated) {
                if (this.coefficientUpdated.hasOwnProperty(currency)) {
                    if (!this.isCoefficientUpdated(currency)) {
                        console.log(`Coefficient for ${currency} not updated, updating ....`)
                        this.updateCoefficient(currency)
                    }
                }
            }
            winston.info(`Coefficients up to date`)
            await setDelay(this.updateFrequency)
            this.coefficientUpdater()
        } catch (error) {
            winston.error(`Error checking is coefficients up to date, restartting in ${this.updateFrequency}`, error)
            await setDelay(5000)
        }
    }

    private filterTokenPrices(prices: any[], tokens: IToken[]): any {
        const coefficient: number = prices[1]
        const altContract: string = "0x0000000000000000000000000000000000000000"; // ETH, EHC, POA, CLO
        const pricesMap: IPriceDB[] = prices[0].reduce((map: any, ticker: any) => {
            map[ticker["website_slug"]] = ticker;
            return map;
        }, {});

        const altValues = {
            "ETH": "ethereum",
            "ETC": "ethereum-classic",
            "POA": "poa-network",
            "CLO": "callisto-network"
        }

        return tokens.map((token: IToken) => {
            const contract: string = token.contract.toLowerCase()
            const symbol: string = token.symbol.toUpperCase()

            if (contract === altContract && altValues.hasOwnProperty(symbol)) {
                const slug = altValues[token.symbol];
                const tokenPrice: IPriceDB = pricesMap[slug];
                const price: string = tokenPrice.price ? (tokenPrice.price / coefficient).toString() : "0"
                const percent_change_24h: string = tokenPrice.percent_change_24h ? (tokenPrice.percent_change_24h).toString() : "0"

                return {
                    id: tokenPrice["website_slug"],
                    name: tokenPrice.name,
                    symbol,
                    price,
                    percent_change_24h,
                    contract,
                    image: this.getImageUrl(token.contract),
                }
            } else if (contracts.hasOwnProperty(contract)) {
                const slug: string = contracts[contract].id;
                const tokenPrice: any = pricesMap[slug] || {};
                const price: string = tokenPrice.price ? (tokenPrice.price / coefficient).toString() : "0"
                const percent_change_24h: string = tokenPrice.percent_change_24h ? (tokenPrice.percent_change_24h).toString() : "0"

                return {
                    id: tokenPrice["website_slug"] || "",
                    name: tokenPrice.name || "",
                    symbol: token.symbol || "",
                    price,
                    percent_change_24h,
                    contract,
                    image: this.getImageUrl(contract),
                }
            } else {
                return {
                    id: "",
                    name: "",
                    symbol,
                    price: "0",
                    percent_change_24h: "0",
                    contract,
                    image: this.getImageUrl(contract),
                }
             }
        })
    }

    private async bulkUpdateUSD(prices: IPrice[]) {
        try {
            const bulkOps = prices.map(price => {
                const quote = price.quotes.USD
                return {
                    updateOne: {
                        filter: { website_slug: price.website_slug },
                        update: {
                            id: price.id,
                            name: price.name,
                            symbol: price.symbol,
                            website_slug: price.website_slug,
                            rank: price.rank,
                            circulating_supply: price.circulating_supply,
                            total_supply: price.total_supply,
                            price: quote.price,
                            volume_24h: quote.volume_24h,
                            market_cap: quote.market_cap,
                            percent_change_1h: quote.percent_change_1h,
                            percent_change_24h: quote.percent_change_24h,
                            percent_change_7d: quote.percent_change_7d,
                            last_updated: price.last_updated
                        },
                        upsert: true,
                    }
                }
            })

            return await Ticker.bulkWrite(bulkOps)

        } catch (error) {
            winston.error(`Error bulk prices update`, error)
        }
    }

    private async updateCurrencyCoeffiientInDB(currency: string, coefficient: number) {
        return await CurrencyCoefficient.findOneAndUpdate({currency}, {coefficient}, {upsert: true, new: true})
            .catch((error: Error) => {
                winston.error(`Error updating coefficient for currency ${currency}`, error)
            })
    }

    private getImageUrl(contract: string): string {
        return `${this.githubImageURL}${contract.toLowerCase()}.png`;
    }

    private async updateCoefficient(currency: string) {
        winston.info(`Updating coefficient for currency`, currency)
        try {
            this.isUpdating[currency] = true

            const coefficient: number = await this.getCoefficient(currency)
            await this.updateCurrencyCoeffiientInDB(currency, coefficient)

            this.lastestCoefficients[currency] = coefficient
            this.coefficientUpdated[currency] = Date.now()

            this.isUpdating[currency] = false
            winston.info(`Сoefficient updated sucessfully for currency`, currency)
        } catch (error) {
            winston.error(`Error updating coefficient for currency ${currency}`, error)
            Promise.reject(error)
        }
    }

    private isUSDUpdated(): boolean {
        const lastUpdatedTime: number = this.coefficientUpdated.USD || 0
        const difference: number = (Date.now() - lastUpdatedTime) / 1000
        const isUpdating: boolean = this.isUpdating.USD || false
        return !(difference >= this.refreshLimit) && !isUpdating
    }

    private isCoefficientUpdated(currency: string): boolean {
        const lastUpdatedTime: number = this.coefficientUpdated[currency] || 0
        const difference: number = Math.floor((lastUpdatedTime - this.coefficientUpdated.USD) / 1000)
        const isUpdating: boolean = this.isUpdating[currency] || false
        return Number.isInteger(difference) && Math.abs(difference) <= this.refreshLimit && !isUpdating
    }

    private async getPrices(currency: string): Promise<[IPriceDB[], number]> {
        try {
            if (currency === "USD" ) return [this.latestUSDPrices, 1]

            if (this.lastestCoefficients.hasOwnProperty(currency)) {
                return [this.latestUSDPrices, this.lastestCoefficients[currency]]
            }

            await this.updateCoefficient(currency)
            return this.getPrices(currency)
        } catch (error) {
            winston.error(`Error getPrices`, error)
            Promise.reject(error)
        }
    }

    private getAllTokensPricesInUSD() {
        return new BluebirbPromise((resolve, reject) => {
            this.client.getTicker({limit: 0, structure: "array"}).then((prices: any) => {
                resolve(prices);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    private async getCoefficient(currency: string): Promise<number> {
        try {
            const prices = await this.client.getTicker({limit: 1, convert: currency, structure: "array"})
                const quotes: any = prices.data[0].quotes
                const coefficient: number = quotes.USD.price / quotes[currency].price
                return coefficient
        } catch (error) {
            Promise.reject(`Error getting coefficient for currecny "${currency}" ${error}`)
        }
    }

    private async updateUSDPrices() {
        winston.info(`Updating USD prices ... `)
        try {
            const prices: any = await this.getAllTokensPricesInUSD()
            await this.bulkUpdateUSD(prices.data)
            const usdPrices: IPriceDB[] = await Ticker.find({})
            this.latestUSDPrices = usdPrices
            this.coefficientUpdated.USD = Date.now()
            await this.updateCurrencyCoeffiientInDB("USD", 1)

            winston.info(`Prices updated sucsesfully`)
            return Promise.resolve()
        } catch (error) {
            winston.error(`Error updating USD prices`, error)
        }
    }

}
