const express = require("express");
const router = express.Router();
const controller = require("../controllers/listingController");
const { body } = require("express-validator");

router.get("/", controller.home);

// Search by ID
router.get("/search/id", controller.renderSearchIdForm);
router.post(
  "/search/id",
  [
    body("id")
      .notEmpty()
      .withMessage("Property ID is required")
      .isNumeric()
      .withMessage("Property ID must be a number")
      .trim()
      .escape(),
  ],
  controller.searchById
);

router.get("/search/name", (req, res) => {
  if (req.query.name) {
    return controller.searchByName(req, res);
  }
  controller.renderSearchNameForm(req, res);
});
router.post("/search/name", controller.searchByName);

// View All
router.get("/viewData", controller.viewAllListings);
router.get("/viewData/clean", controller.viewCleanListings);

// Search by Price
router.get("/viewData/price", (req, res) => {
  if (req.query.min && req.query.max) {
    return controller.searchByPrice(req, res);
  }
  controller.renderPriceForm(req, res);
});

router.post(
  "/viewData/price",
  [
    body("min")
      .notEmpty()
      .withMessage("Min price required")
      .isFloat({ min: 0 }),
    body("max")
      .notEmpty()
      .withMessage("Max price required")
      .isFloat({ min: 0 }),
  ],
  controller.searchByPrice
);

// Additional Routes

// Insert New Listing
router.get("/listings/create", controller.renderCreateForm);
router.post("/listings/create", controller.createListing);

// Update Listing
router.get("/listings/:id/edit", controller.renderEditForm);
router.post("/listings/:id/edit", controller.updateListing);

// Delete Listing
router.post("/listings/:id/delete", controller.deleteListing);
router.get("/listings/:id", controller.getListingById);

module.exports = router;
