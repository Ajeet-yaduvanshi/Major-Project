const express=require("express");
const router=express.Router({ mergeParams: true });
const warpAsync=require("../utils/warpAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const{validateReview}=require("../middleware.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js"); 
const reviewController=require("../controllers/reviews.js");





//Reviews Route
    router.post("/",isLoggedIn,validateReview,warpAsync(reviewController.createReview));
//Delete Review Route
    router.delete("/:reviewId",isLoggedIn,isReviewAuthor,warpAsync(reviewController.deleteReview));
    module.exports=router;
