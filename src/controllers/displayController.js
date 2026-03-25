import Display from "../models/displayModel.js";
import DonationForm from "../models/DonationFormModel.js";


/*
BUILD INVENTORY
Calculate stock from received donations
*/

export const buildInventory = async (req,res)=>{

try{

const donations = await DonationForm.find({Status:"Received"});

const inventoryMap = {};

donations.forEach(item=>{

const name = item.productName;

if(!inventoryMap[name]){

inventoryMap[name] = {
productName:item.productName,
productCategory:item.productCategory,
unit:item.unit,
totalQuantity:0,
nearestExpireDate:item.expirationDate
};

}

inventoryMap[name].totalQuantity += item.quantity;

if(new Date(item.expirationDate) < new Date(inventoryMap[name].nearestExpireDate)){

inventoryMap[name].nearestExpireDate = item.expirationDate;

}

});

const inventoryArray = Object.values(inventoryMap);

await Display.deleteMany();

const savedItems = await Display.insertMany(inventoryArray);

res.status(200).json({
message:"Inventory built successfully",
data:savedItems
});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};



/*
PUBLISH ITEM WITH IMAGE
*/

export const publishItem = async (req,res)=>{

try{

const {id} = req.params;

const image = req.file?.filename;

const updatedItem = await Display.findByIdAndUpdate(

id,
{
image:image,
published:true
},
{new:true}

);

if(!updatedItem){

return res.status(404).json({
message:"Item not found"
});

}

res.status(200).json({
message:"Item published successfully",
data:updatedItem
});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};


/*
GET DISPLAY ITEMS
Show only published items
Sort by expire date (quick expire first)
*/

export const getDisplayItems = async (req,res)=>{

try{

const items = await Display.find({published:true})
.sort({nearestExpireDate:1});

res.status(200).json({
count:items.length,
data:items
});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};



/*
DELETE DISPLAY ITEM
*/

export const deleteDisplayItem = async(req,res)=>{

try{

const {id} = req.params;

const deleted = await Display.findByIdAndDelete(id);

if(!deleted){

return res.status(404).json({
message:"Item not found"
});

}

res.status(200).json({
message:"Item deleted",
data:deleted
});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};