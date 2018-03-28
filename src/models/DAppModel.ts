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
        type: Schema.Types.ObjectId
    }],
    enabled: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true,
    toObject: {
      toJSON: {
        transform: (doc: any, ret: any) => {
          delete ret._id;
        }
      }
    }
});

scheme.options.toJSON = {
    transform: (doc: any, ret: any, options: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.enabled;
        return ret;
    }
};

scheme.plugin(mongoosePaginate);

export const DApp = mongoose.model("DApp", scheme);
