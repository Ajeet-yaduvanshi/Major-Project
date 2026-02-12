if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}));
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const ExpressError=require("./utils/ExpressError.js");
const Listing=require("./models/listing.js");
const warpAsync=require("./utils/warpAsync.js");
const{listingSchema,reviewSchema}=require("./schema.js");
//const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;
const Review=require("./models/review.js");
const listingsRoutes = require('./routes/listing.js');
const reviewsRoutes = require('./routes/review.js');
const userRoutes=require("./routes/user.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



async function startServer() {
  try {
    await mongoose.connect(dbUrl);
    console.log("connected to DB");

    app.listen(8080, () => {
      console.log("listening port 8080");
    });

  } catch (err) {
    console.log("DB CONNECTION ERROR:", err);
  }
}

startServer();

   
    
   
    const store = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "sessions",
    touchAfter: 24 * 3600,
});

    store.on("error",function(e){console.log("SESSION STORE ERROR",e); });
     

    const sessionOptions={
        store,
        secret:process.env.SECRET,
        resave:false,
        saveUninitialized:false,
        cookie:{
            expires:Date.now()+1000*60*60*24*7, //1 week
            maxAge:1000*60*60*24*7,
            httpOnly:true
        }
    };


    app.use(session(sessionOptions));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
    app.use((req,res,next)=>{
        res.locals.success=req.flash("success");
        res.locals.error=req.flash("error");
        res.locals.currentUser=req.user;
        next();
    });
    
    app.use("/listings",listingsRoutes);
    
    app.use("/listings/:id/reviews",reviewsRoutes);
    app.use("/",userRoutes);
    app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});
