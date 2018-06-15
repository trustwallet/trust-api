export interface IToken {
    contract: string;
    symbol: string;
}

export interface IPrice {
    id: number,
    name: string,
    symbol: string,
    website_slug: string
    rank: number,
    circulating_supply: number | null
    total_supply: number,
    max_supply: number | null,
    quotes: {USD: ICurrency}
    last_updated: number,
}

export interface ICurrency {
    USD: {
        market_cap: number
        percent_change_1h: number
        percent_change_24h: number
        percent_change_7d: number
        price: number
        volume_24h: number
    }
}