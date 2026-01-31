const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReviews, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require ("../controllers/review.js")

router.post ("/",validateReviews, isLoggedIn, wrapAsync (reviewController.createReview))

//Delete Review
router.delete ("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;