const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const warpAsync=require("../utils/warpAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage:storage});

router.route("/")
    .get(warpAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"), validateListing, warpAsync(listingController.createListing)
);
router.get("/search", async (req, res, next) => {
  try {
    const { country } = req.query;

    const query = country
      ? { country: { $regex: `^${country}$`, $options: "i" } }
      : {};

    const listings = await Listing.find(query);

    return res.render("index.ejs", {
      allListings: listings
    });

  } catch (err) {
    req.flash("error", "Search failed");
    return res.redirect("/listings");   // ✅ RETURN ADDED
  }
});


// Get unique countries for search
router.get("/countries/list", async (req, res, next) => {
  try{
    const countries = await Listing.distinct("country");
     return res.json(countries);
  }catch(err){
    return next(err);
  }
});


//Create new Listing Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(warpAsync(listingController.showListing))
    .put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, warpAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, warpAsync(listingController.deleteListing)
);
//Edit Route
    router.get("/:id/edit", isLoggedIn, isOwner, warpAsync(listingController.renderEditForm));



        
        module.exports=router;