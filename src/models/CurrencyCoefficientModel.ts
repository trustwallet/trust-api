const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    currency: {
        type: String,
        index: true,
        uppercase: true
    },
    coefficient: {
        type: Number
    }
}, {
    versionKey: false,
    timestamps: true,
})

export const CurrencyCoefficient = mongoose.model("CurrencyCoefficient", schema)
