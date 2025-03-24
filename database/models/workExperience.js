  const mongoose = require("mongoose");

  const WorkExperienceSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      hasWorkExperience: { type: Boolean, required: true, default: false },
      jobTitle: { type: String },
      organizationName: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      employmentType: { type: String, enum: ["fullTime", "partTime"] },
      isFullTime: { type: Boolean },
      isPartTime: { type: Boolean },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("WorkExperience", WorkExperienceSchema);
