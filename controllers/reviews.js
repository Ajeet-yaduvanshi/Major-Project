const Review=require("../models/review.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {reviewSchema}=require("../schema.js");

module.exports.createReview = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    return res.redirect(`/listings/${listing._id}`);

  } catch (err) {
    return next(err);   
  }
};


module.exports.deleteReview = async (req, res, next) => {
  try {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted Successfully!");
    return res.redirect(`/listings/${id}`);

  } catch (err) {
    return next(err);
  }
};
