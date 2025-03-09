const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage});


router
  .route("/")
  .get(wrapAsync(listingController.index))//index
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    validateListing, wrapAsync(listingController.createListing));//create
 

//New route
router.get("/new",isLoggedIn,listingController.renderNewForm)//new route abve the show route ,it will understand that id ==new for below it
    
router.route("/:id")
.get( wrapAsync(listingController.showListing))//show
.put(
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing))//update
  .delete(isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing));//delete

    //Edit Route
    router.get("/:id/edit",isLoggedIn,
      isOwner,
      wrapAsync(listingController.renderEditForm));

module.exports = router;
