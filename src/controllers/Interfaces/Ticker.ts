export interface Ticker {
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

export interface TickerParams {
    currency: string,
    ids: string,
    page_number: string | number,
    page_size: string | number,
    sort: string
}

// export enum TickersSortBy {
//     PriceAsc = "price_asc",
//     PriceDesc = "price_desc",
//     MarketCapAsc = "market_cap_asc",
//     MarketCapDesc = "market_cap_desc",
//     RankAsc = "rank_asc",
//     RankDesc = "rank_desc",
//     Volume24HAsc = "volume_24h_asc",
//     Volume24HDesc = "volume_24h_desc",
// }
