const mongoose = require("mongoose");
const fetch = require("node-fetch");
const Listing = require("./models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateAll() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");

  const listings = await Listing.find({});

  for (let listing of listings) {

    const address = `${listing.location}, ${listing.country}`;

    console.log("Updating:", address);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );

      const data = await res.json();

      if (data.length > 0) {
        listing.geometry = {
          type: "Point",
          coordinates: [
            parseFloat(data[0].lon),
            parseFloat(data[0].lat)
          ]
        };

        await listing.save();
        console.log("✅ Updated:", listing.title);
      } else {
        console.log("❌ Not found:", address);
      }

    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  console.log("🔥 ALL LISTINGS UPDATED");
  process.exit();
}

updateAll();
