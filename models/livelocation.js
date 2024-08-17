// models/Location
// const mongoose = require("mongoose");

// const livelocationSchema = new mongoose.Schema({
//   providerId:{type: String},
//   latitude:{type: String},
//   longitude:{type: String},
//   altitude: { type: String},
//   heading:{type: String},
//   speed: { type: String}
// });

// module.exports = mongoose.model("livelocation", livelocationSchema);


const mongoose = require("mongoose");

const livelocationSchema = new mongoose.Schema({
  providerId: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  altitude: { type: String },
  heading: { type: String },
  speed: { type: String }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model("livelocation", livelocationSchema);
