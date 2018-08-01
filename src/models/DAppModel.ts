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
    description: {
        type: String,
    },
    url: {
        type: String,
        index: {
            unique: true
        }
    },
    image: {
        type: String,
    },
    category: [{
        ref: "DAppCategory",
        type: Schema.Types.ObjectId,
        index: true
    }],
    networks: [{
        type: Number,
        index: true
    }],
    enabled: {
        type: Boolean,
        default: false
    },
    digitalGood: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true,
});

scheme.options.toJSON = {
    transform: (doc: any, ret: any, options: any) => {
        delete ret.__v;
        delete ret.enabled;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    }
};

scheme.plugin(mongoosePaginate);

export const DApp = mongoose.model("DApp", scheme);
