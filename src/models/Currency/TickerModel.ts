const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    website_slug: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    rank: {
        type: Number,
        required: true
    },
    circulating_supply: {
        type: Number,
        required: true
    },
    total_supply: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    volume_24h: {
        type: Number,
        required: true
    },
    market_cap: {
        type: Number,
        required: true
    },
    percent_change_1h: {
        type: Number,
        required: true
    },
    percent_change_24h: {
        type: Number,
        required: true
    },
    percent_change_7d: {
        type: Number,
        required: true
    },
    last_updated: {
        type: Number,
        require: true
    }
},
{
    versionKey: false,
    timestamps: true,
}
)

export const TickerModel = mongoose.model("Ticker", schema)