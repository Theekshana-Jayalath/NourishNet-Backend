import mongoose from "mongoose";

const displaySchema = new mongoose.Schema(
{
  productName:{
    type:String,
    required:true,
    trim:true
  },

  productCategory:{
    type:String,
    required:true
  },

  unit:{
    type:String,
    required:true
  },

  totalQuantity:{
    type:Number,
    default:0
  },

  nearestExpireDate:{
    type:Date
  },

  image:{
    type:String
  },

  published:{
    type:Boolean,
    default:false
  }

},
{timestamps:true}
);

const Display = mongoose.model("Display", displaySchema);

export default Display;