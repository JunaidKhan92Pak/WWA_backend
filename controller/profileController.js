const languageProficiencyDb = require("../database/models/languageProficiency");
const academicInfoDb = require("../database/models/userAcademicInfoDb");
const userPeferenceDb = require('../database/models/userPreference')
const UserDb = require("../database/models/UserDb");

const profileController = {
    personalInfomation: async (req, res) => {
        const { contactNo, dob, nationality, country, city } = req.body;
        try {

            // if (!contactNo || !dob || !nationality || !country || !city) {
            //     return res.status(400).json({
            //         message: "All fields are required. Please ensure none are empty.",
            //         success:false
            //     });
            // }

            const userId = req.user?.id; // Safely access req.user and get userId
            if (!userId) {
                return res.status(401).json({ message: "Login First to update Personal Information", success: false });
            }
            // Update user information
            const user = await UserDb.findOneAndUpdate(
                { _id: userId },
                {
                    $set: {
                        contactNo,
                        dob,
                        nationality,
                        country,
                        city,
                    },
                },
                { new: true, upsert: true } // Return the updated document or create a new one
            );
            // Return the updated user data
            return res.status(200).json({ message: "Updated Personal Information", success: true, user });
        } catch (error) {
            // Log the error for debugging (optional)
            console.error("Error updating personal information:", error);

            // Return a server error response
            res.status(500).json({ error: "Internal Server Error", success: false });
        }
    },

    // Academic Information Controller
    academicInformation: async (req, res) => {
        // Destructure request body
        const {
            highestQualification,
            majorSubject,
            previousGradingScale,
            previousGradingScore,
            standarizedTest,
            standarizedTestScore,
        } = req.body;
        try {
            // if (!highestQualification || !majorSubject || !previousGradingScale || ! previousGradingScore || !standarizedTest ,!standarizedTestScore) {
            //     return res.status(400).json({
            //         message: "All fields are required. Please ensure none are empty.",
            //         success:false
            //     });
            // }
            // Ensure user ID is present
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: "Unauthorized: Please log in to update academic information.",
                    success: false,
                });
            }
            // Update or insert academic information
            const academicInformation = await academicInfoDb.findOneAndUpdate(
                { user: userId },
                {
                    $set: {
                        highestQualification,
                        majorSubject,
                        previousGradingScale,
                        previousGradingScore,
                        standarizedTest,
                        standarizedTestScore,
                    },
                },
                { new: true, upsert: true } // Return updated document or create if not exists
            );

            // Return success response
            return res.status(200).json({
                message: "Updated academic information successfully.",
                success: true,
                academicInformation, // Optionally return updated data
            });
        } catch (error) {
            // Log error for debugging
            console.error("Error handling academic information route:", error);

            // Return generic server error response
            return res.status(500).json({
                message: "Internal server error while updating academic information.",
                success: false,
            });
        }
    },
    getAcademicInformation: async (req, res) => {
        try {
            // Check if user is authenticated
            if (!req.user?.id) {
                return res.status(403).json({
                    message: "Forbidden: Please log in first.",
                    success: false
                });
            }

            const userId = req.user.id;

            // Fetch academic information
            const academicInformation = await academicInfoDb.findOne({ user: userId });
            if (!academicInformation) {
                return res.status(404).json({
                    message: "No academic information found for this user.",
                    success: false
                });
            }

            // Return success response
            return res.status(200).json({
                message: "Academic information retrieved successfully.",
                success: true,
                academicInformation
            });
        } catch (error) {
            // Log the error for debugging
            console.error("Error retrieving academic information:", error);

            // Return server error response
            return res.status(500).json({
                message: "Internal server error while retrieving academic information.",
                success: false
            });
        }
    },
    // English Proficiency controller
    languageProficiency: async (req, res) => {
        const { proficiencyLevel, proficiencyTest, proficiencyTestScore } =
            req.body;
        // save academic information in db
        try {
            // if (!proficiencyLevel || !proficiencyTest|| ! || !proficiencyTestScore ) {
            //     return res.status(400).json({
            //         message: "All fields are required. Please ensure none are empty.",
            //         success:false
            //     });
            // }
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: "Login required to update user preferences.",
                    success: false,
                });
            }
            const languageProficiency = await languageProficiencyDb.findOneAndUpdate(
                { user: userId },
                {
                    $set: {
                        proficiencyLevel,
                        proficiencyTest,
                        proficiencyTestScore,
                    },
                },
                { new: true, upsert: true } // Creates a new document if none exists
            );
            return res.status(200).json({
                message: "Updated  English Proficiency information",
                success: true,
                languageProficiency
            });
        } catch (error) {
            console.error(
                `Error handling  English Proficiency controller : ${error}`
            );
            return res.status(500).json({
                message: "Internal server error in English proficiency controller",
                success: false,
            });
        }
    },
    userPreference: async (req, res) => {
        const { degreeLevel, fieldOfStudy, perferredCountry, perferredCity, studyBudget, studyMode } = req.body;
        try {
            // if (!degreeLevel || !fieldOfStudy|| !perferredCountry || !perferredCity || !studyBudget || !studyMode ) {
            //     return res.status(400).json({
            //         message: "All fields are required. Please ensure none are empty.",
            //         success:false
            //     });
            // }
            // Validate user ID from middleware
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: "Login required to update user preferences.",
                    success: false,
                });
            }
            // Update or insert user preferences
            const userPreference = await userPeferenceDb.findOneAndUpdate(
                { user: userId }, // Match user by ID
                {
                    $set: {
                        degreeLevel,
                        fieldOfStudy,
                        perferredCountry,
                        perferredCity,
                        studyBudget,
                        studyMode,
                    },
                },
                { new: true, upsert: true } // Return updated document or create if not exists
            );

            // Success response
            return res.status(200).json({
                message: "User preferences updated successfully.",
                success: true,
                userPreference, // Optionally return updated data
            });
        } catch (error) {
            // Log error for debugging
            console.error(`Error updating user preferences: ${error}`);

            // Server error response
            return res.status(500).json({
                message: "Internal server error while updating user preferences.",
                success: false,
            });
        }
    }
};
module.exports = profileController;
