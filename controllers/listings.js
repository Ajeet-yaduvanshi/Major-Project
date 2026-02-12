const Listing=require("../models/listing");
const fetch=require("node-fetch");
module.exports.index=async(req,res)=>{
        const allListings=await Listing.find({});
       res.render("index",{allListings});
    };
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new");
};

module.exports.showListing=async(req,res)=>{
        let{id}=req.params;
        const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
        if(!listing){
            req.flash("error","Cannot find that listing!");
            return res.redirect("/listings");
        }
        res.render("listings/show",{listing});
    };


module.exports.createListing = async (req, res, next) => {
  try {
    const listingData = req.body.listing;

    const newListing = new Listing(listingData);

    const address = `${listingData.location}, ${listingData.country}`;

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );

      const geoData = await geoRes.json();

      if (geoData.length > 0) {
        newListing.geometry = {
          type: "Point",
          coordinates: [
            parseFloat(geoData[0].lon),
            parseFloat(geoData[0].lat),
          ],
        };
      }
    } catch (err) {
      console.log("Geocode failed – using default");
      newListing.geometry = {
        type: "Point",
        coordinates: [77.1025, 28.7041],
      };
    }

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "Successfully created a new listing!");
    return res.redirect("/listings");

  } catch (err) {
    return next(err);  
  }
};

module.exports.renderEditForm=async(req,res)=>{
            let{id}=req.params;
            const listing=await Listing.findById(id);
            if(!listing){
                req.flash("error","Cannot find that listing!");
                return res.redirect("/listings");
            }
            res.render("listings/edit",{listing});
        };

module.exports.updateListing = async (req, res, next) => {
  try {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { new: true }
    );

    const address = `${listing.location}, ${listing.country}`;

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );

      const geoData = await geoRes.json();

      if (geoData.length > 0) {
        listing.geometry = {
          type: "Point",
          coordinates: [
            parseFloat(geoData[0].lon),
            parseFloat(geoData[0].lat),
          ],
        };
      }
    } catch (err) {
      console.log("Geocode error:", err.message);
    }

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();

    req.flash("success", "Listing Updated Successfully!");
    return res.redirect(`/listings/${listing._id}`);

  } catch (err) {
    return next(err);
  }
};

module.exports.deleteListing=async(req,res)=>{
            let{id}=req.params;
            let deletedListing=await Listing.findByIdAndDelete(id);
            console.log(deletedListing);
            req.flash("success","Listing Deleted Successfully!");
            res.redirect("/listings");
        };


