const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: [true, "Property name is required"],
    },
    NAME: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    "host id": String,
    host_identity_verified: String,
    "host name": String,
    "neighbourhood group": String,
    neighbourhood: String,
    lat: String,
    long: String,
    country: String,
    "country code": String,
    instant_bookable: String,
    cancellation_policy: String,
    "room type": {
      type: String,
      enum: {
        values: [
          "Private room",
          "Entire home/apt",
          "Shared room",
          "Hotel room",
        ],
        message: "{VALUE} is not a valid room type",
      },
      default: "Private room",
    },
    "Construction year": String,
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    "service fee": Number,
    "minimum nights": String,
    "number of reviews": String,
    "last review": String,
    "reviews per month": String,
    "review rate number": String,
    "calculated host listings count": String,
    "availability 365": String,
    house_rules: String,
    license: String,
    property_type: String,
    thumbnail: String,
    images: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Listing", ListingSchema);
