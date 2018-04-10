const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const scheme = new Schema({
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    order: {
        type: Number,
    },
    slug: {
        type: String
    },
    limit: {
        type: Number
    }
}, {
    versionKey: false,
});

scheme.plugin(mongoosePaginate);

export const DAppCategory = mongoose.model("DAppCategory", scheme);
