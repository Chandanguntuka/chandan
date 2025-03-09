const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
   await mongoose.connect(MONGO_URL);
}

const initDB = async() =>{
   await Listing.deleteMany({});//deelting the past data that we used
   initData.data =  initData.data.map((obj) => ({...obj, owner: '67c1b088c72cb915d9f1c8d8'}));
   await Listing.insertMany(initData.data);
 
   console.log("data was initiallized");
};

initDB();

