const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const scheme = new Schema({
    name: {
        type: String,
    },
    short_description: {
        type: String,
    },
    long_description: {
        type: String,
    },
    image: {
        type: String,
    },
    category: [{
        ref: "DAppCategory",
        type: Schema.Types.ObjectId
    }]
}, {
    versionKey: false,
});

scheme.plugin(mongoosePaginate);

export const DApp = mongoose.model("DApp", scheme);
