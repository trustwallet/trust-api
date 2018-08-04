export interface TickerI {
    website_slug: string;
    circulating_supply: number;
    id: number;
    last_updated: number;
    market_cap: number;
    name: string;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    price: number;
    rank: number;
    symbol: string;
    total_supply: number;
    volume_24h: number;
}

export enum Currencies {
    USD = "USD",
}

export enum TickersSortCriteria {
    PriceAsc = "price_asc",
    PriceDesc = "price_desc",
    MarketCapAsc = "market_cap_asc",
    MarketCapDesc = "market_cap_desc"
}
