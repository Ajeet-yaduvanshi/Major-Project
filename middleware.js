const Listing=require("./models/listing");
const ExpressError=require("./utils/ExpressError.js");
const Review=require("./models/review.js");
const {listingSchema,reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}



module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map(el => el.message).join(",");
    return next(new ExpressError(400, errMsg));
  }

  next();
};


module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        req.flash("error","You don't have permission to edit or delete this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to delete this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        // throw new ExpressError(400, errMsg);
        return next(new ExpressError(400, errMsg)); 
    } 
        next();
    
};
