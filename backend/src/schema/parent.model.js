import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const parentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

parentSchema.plugin(mongooseAggregatePaginate);

export const Parent = mongoose.model("Parent", parentSchema);
