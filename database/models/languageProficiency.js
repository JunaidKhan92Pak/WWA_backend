const mongoose = require('mongoose');

const languageProficiencySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Assuming a User model exists
            required: true, // Tie proficiency to a specific user
        },
        proficiencyLevel: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'], // Restrict to specific levels
            //required: true,
        },
        proficiencyTest: {
            type: String,
            default: '', // Optional field with a default empty string
        },
        proficiencyTestScore: {
            type: String,
            default: 'N/A', // Optional field with a default value
        },
    },
    { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the model
const LanguageProficiency = mongoose.model('LanguageProficiency', languageProficiencySchema);

// Export the model
module.exports = LanguageProficiency;
