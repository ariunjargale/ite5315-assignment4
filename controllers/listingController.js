const Listing = require("../models/listing");
const { validationResult } = require("express-validator");

// Home Page
exports.home = (req, res) => {
  res.render("index", { title: "Assignment 4" });
};

// View all listings
exports.viewAllListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalDocs = await Listing.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const listings = await Listing.find().skip(skip).limit(limit).lean();

    let successMsg = "";
    if (req.query.status === "deleted") {
      successMsg = "Listing deleted successfully!";
    }

    res.render("viewData", {
      title: "All Data",
      listings: listings,
      page: page,
      totalPages: totalPages,
      successMessage: successMsg,
    });
  } catch (err) {
    res.status(500).send("Error retrieving data");
  }
};

// View Clean Listings
exports.viewCleanListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { NAME: { $exists: true, $ne: "" } };

    const totalDocs = await Listing.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);

    const listings = await Listing.find(query).skip(skip).limit(limit).lean();

    res.render("viewDataClean", {
      title: "Clean Data",
      listings: listings,
      page: page,
      totalPages: totalPages,
    });
  } catch (err) {
    res.status(500).send("Error retrieving clean data");
  }
};

// Search by ID Form
exports.renderSearchIdForm = (req, res) => {
  res.render("searchIdForm", { title: "Search by ID" });
};

exports.searchById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("searchIdForm", {
      title: "Search by ID",
      errors: errors.array(),
    });
  }

  try {
    const id = req.body.id;
    const property = await Listing.findOne({ id: id }).lean();

    if (property) {
      res.render("propertyDetail", { title: "Property Info", property });
    } else {
      res.render("notFound", { title: "Not Found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
};

// Search Name Form
exports.renderSearchNameForm = (req, res) => {
  res.render("searchNameForm", { title: "Search by Property Name" });
};

exports.searchByName = async (req, res) => {
  try {
    const searchName = req.body?.name ?? req.query?.name;

    if (!searchName) {
      return res.redirect("/search/name");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { NAME: { $regex: searchName.trim(), $options: "i" } };

    const totalDocs = await Listing.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);

    const listings = await Listing.find(query).skip(skip).limit(limit).lean();

    res.render("searchNameResults", {
      title: `Search Results for "${searchName}"`,
      listings: listings,
      page: page,
      totalPages: totalPages,
      searchName: searchName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
};

// Search Price Form
exports.renderPriceForm = (req, res) => {
  res.render("priceForm", { title: "Search by Price Range" });
};

exports.searchByPrice = async (req, res) => {
  if (req.method === "POST") {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("priceForm", {
        title: "Search by Price Range",
        errors: errors.array(),
      });
    }
  }

  try {
    const min = req.body?.min ?? req.query?.min;
    const max = req.body?.max ?? req.query?.max;

    if (!min || !max) {
      return res.redirect("/viewData/price");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = {
      price: { $gte: parseFloat(min), $lte: parseFloat(max) },
    };

    const totalDocs = await Listing.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);

    const listings = await Listing.find(query).skip(skip).limit(limit).lean();

    res.render("priceResults", {
      title: `Listings Between $${min} and $${max}`,
      listings: listings,
      page: page,
      totalPages: totalPages,
      minPrice: min,
      maxPrice: max,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
};

// Create New Listing
exports.renderCreateForm = (req, res) => {
  res.render("createListing", { title: "Add New Listing" });
};

exports.createListing = async (req, res) => {
  try {
    const newListingData = {
      id: req.body.id,
      NAME: req.body.NAME,
      "host name": req.body["host name"],
      host_identity_verified: req.body.host_identity_verified,
      neighbourhood: req.body.neighbourhood,
      country: req.body.country,
      "room type": req.body["room type"],
      price: parseFloat(req.body.price),
      "number of reviews": req.body["number of reviews"],
      "review rate number": req.body["review rate number"],
      house_rules: req.body.house_rules,
    };

    await Listing.create(newListingData);

    res.redirect(`/listings/${newListingData.id}?status=created`);
  } catch (err) {
    res.render("createListing", {
      title: "Add New Listing",
      error: "Error adding listing: " + err.message,
    });
  }
};

// Update Listing
exports.renderEditForm = async (req, res) => {
  try {
    const listing = await Listing.findOne({ id: req.params.id }).lean();

    if (!listing) {
      return res.render("error", { message: "Listing not found" });
    }

    res.render("editListing", {
      title: "Edit Listing",
      listing: listing,
    });
  } catch (err) {
    res.status(500).send("Error loading form");
  }
};

exports.updateListing = async (req, res) => {
  try {
    const updateData = {
      NAME: req.body.NAME,
      price: parseFloat(req.body.price),
    };

    await Listing.findOneAndUpdate({ id: req.params.id }, updateData, {
      runValidators: true,
    });

    res.redirect(`/listings/${req.params.id}?status=updated`);
  } catch (err) {
    const listing = req.body;
    listing.id = req.params.id;
    res.render("editListing", {
      title: "Edit Listing",
      listing: listing,
      error: "Update failed: " + err.message,
    });
  }
};

// Delete Listing
exports.deleteListing = async (req, res) => {
  try {
    const deleted = await Listing.findOneAndDelete({ id: req.params.id });

    if (!deleted) {
      return res.render("error", { message: "Listing not found to delete" });
    }
    res.redirect("/viewData?status=deleted");
  } catch (err) {
    res.render("error", { message: "Error deleting listing: " + err.message });
  }
};

// Get Listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findOne({ id: req.params.id }).lean();

    if (!listing) {
      res.render("notFound", { title: "Not Found" });
    }

    let successMsg = "";
    if (req.query.status === "created") {
      successMsg = "New listing created successfully!";
    } else if (req.query.status === "updated") {
      successMsg = "Listing updated successfully!";
    }

    res.render("propertyDetail", {
      title: listing.NAME,
      property: listing,
      successMessage: successMsg,
    });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};
