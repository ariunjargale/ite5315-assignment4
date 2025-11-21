require("dotenv").config();
const mongoose = require("mongoose");
const config = require("./config/database");

const Listing = mongoose.model(
  "Listing",
  new mongoose.Schema({}, { strict: false })
);

const cleanNumber = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return value;
  const cleaned = value.toString().replace(/[$, ]/g, "");
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};

mongoose
  .connect(config.url)
  .then(async () => {
    console.log("MongoDB Connected. Starting cleanup...");

    const listings = await Listing.find({
      $or: [
        { price: { $type: "string" } },
        { "service fee": { $type: "string" } },
      ],
    });

    console.log(`Found ${listings.length} documents to fix.`);

    if (listings.length === 0) {
      console.log("Nothing to fix!");
      process.exit(0);
    }

    const bulkOps = listings.map((item) => {
      const updates = {};

      const fields = ["price", "service fee"];

      fields.forEach((field) => {
        if (item[field] && typeof item[field] === "string") {
          updates[field] = cleanNumber(item[field]);
        }
      });

      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $set: updates },
        },
      };
    });

    console.log("Sending bulk update request...");
    const result = await Listing.bulkWrite(bulkOps);

    console.log(`Done! Modified ${result.modifiedCount} documents.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
