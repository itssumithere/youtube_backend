import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const vedioSchema = new Schema({
    vedioFile : {
        type: String,
        required : true,
    },
    thumbnail : {
        type: String,
        required : true,
    },
    title : {
        type: String,
        required : true,
    },
    discription : {
        type: String,
        required : true,
    },
    duration : {
        type: String,
        required : true,
    },
    views : {
        type: Number,
        default : 0,
    },
    published : {
        type: Boolean,
        default : true,
    },
    owner : {
        type: Schema.Types.ObjectId,
        ref: "User "
    }




})

vedioSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video",vedioSchema)