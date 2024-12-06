const express = require("express");
const { askAI } = require("../controller/aiController");
const authenticateAiToken = require("../middlewares/authAi");
const UserDb = require("../database/models/UserDb");
const academicDb = require("../database/models/userAcademicInfoDb");
const languageDb = require("../database/models/languageProficiency");
const userPrefDb = require("../database/models/userPreference");
const router = express.Router();

const sessionStore = {}; // In-memory session store (consider Redis for production)

router.post("/", authenticateAiToken, async (req, res) => {
    const userPrompt = req.body.userPrompt;
    const userId = req.user?.id;

    try {
        if (!userPrompt) {
            return res
                .status(400)
                .json({ message: "User Prompt is required", success: false });
        }

        // Initialize session memory for user if not present
        if (!sessionStore[userId]) {
            sessionStore[userId] = {
                hasInteracted: false,
                conversation: [],
            };
        }

        const conversation = sessionStore[userId].conversation;
        const systemMessage = {
            role: "system",
            content: "You are ZEUS, a helpful assistant. Respond based on the provided userInfo, previous conversation, and context. Never reveal that the information was sourced from the user data.",
        };

        let messages;

        if (!sessionStore[userId].hasInteracted) {
            // Fetch user information only for the first interaction
            // const userData = await UserDb.findById(userId).catch(err => null);
            // const academicData = await academicDb.findOne({ user: userId }).catch(err => null);
            // const languageData = await languageDb.findOne({ user: userId }).catch(err => null);
            // const userPrefData = await userPrefDb.findOne({ user: userId }).catch(err => null);
            // const userInfo =  {name :`${userData.firstName} ${userData.lastName}` , city:userData.city , country:userData.country}
            // const prompt = `Save This for Future Json Object Conversation ${JSON.stringify(userInfo)} ${userPrompt}`
            // console.log(prompt);
            
            // Include user data in the first prompt
            messages = [
                systemMessage,
                { role: "user", content: userPrompt },
            ];
            // Mark user as having interacted
            sessionStore[userId].hasInteracted = true;
        } else {
            // Use only the conversation history and the current prompt
            console.log(userPrompt);
            messages = [
                systemMessage,
                ...conversation,
                { role: "user", content: userPrompt },
            ];
        }

        // Ask AI with the constructed messages
        const answer = await askAI(messages);

        // Update conversation history
        conversation.push({ role: "user", content: userPrompt });
        conversation.push({ role: "assistant", content: answer });
        res.status(200).json({ success: true, answer });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
