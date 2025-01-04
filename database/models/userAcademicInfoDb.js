const mongoose = require("mongoose");

const acdemicInfoSchema = mongoose.Schema({
  highestQualification: {
    type: String,
  },
  majorSubject: {
    type: String,
  },
  previousGradingScale: {
    type: String,
  },
  previousGradingScore: {
    type: String,
  },
  standarizedTest: {
    type: String,
  },
  standarizedTestScore: {
    type: String,
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDb"  // Reference to UserDb model to link academicInfo with user.
  }
});

// Create a model
const academicInfo = mongoose.model("AcademicInfo", acdemicInfoSchema);

// Export the model
module.exports = academicInfo;
