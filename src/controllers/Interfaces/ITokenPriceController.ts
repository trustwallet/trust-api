export interface IToken {
    contract: string;
    symbol: string;
}

export interface IPrice extends ITicker, IQuotes {
}

interface ITicker {
    id: number,
    name: string,
    symbol: string,
    website_slug: string
    rank: number,
    circulating_supply: number | null
    total_supply: number,
    max_supply: number | null,
    last_updated: number,
}

export interface IQuotes {
    quotes: {USD: ICurrencyQuote, [key: string]: ICurrencyQuote}
}

export interface ICurrencyQuote {
        market_cap: number
        percent_change_1h: number
        percent_change_24h: number
        percent_change_7d: number
        price: number
        volume_24h: number
}

export interface IPriceDB extends ITicker, ICurrencyQuote {
}

export interface ICoefficient {
    coefficient: number,
    currency: string,
    createdAt: any,
    updatedAt: any,
}