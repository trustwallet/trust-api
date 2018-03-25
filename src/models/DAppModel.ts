const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
}, {
    versionKey: false,
});

tokenSchema.plugin(mongoosePaginate);

export const DApp = mongoose.model("DApp", tokenSchema );
