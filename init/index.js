const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
//const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

async function main(){
   await mongoose.connect(process.env.ATLASDB_URL);
};
main()
    .then((res)=>{console.log("connected to DB")})
    .catch((err)=>{console.log(err)});

const initDB=async()=>{
    await Listing.deleteMany();
    initData.data = initData.data.map((obj)=>({...obj, owner:"69873be2ede76dd5db5dc298"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialised")
}
initDB();