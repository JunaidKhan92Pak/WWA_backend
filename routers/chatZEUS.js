const express = require("express");
const { chatZEUS } = require("../controller/aiController");
const authenticateAiToken = require("../middlewares/authAi");
const UserDb = require("../database/models/UserDb");
const router = express.Router();

const sessionStore = {}; // In-memory session store (consider Redis for production)

router.post("/", authenticateAiToken, async (req, res) => {
    const userPrompt = req.body.userPrompt;
    const userId = req.user?.id;

    try {
        if (!userPrompt) {
            return res.status(400).json({ message: "User Prompt is required", success: false });
        }

        // Initialize session memory for the user if not present
        if (!sessionStore[userId]) {
            sessionStore[userId] = { hasInteracted: false, conversation: [] };
        }

        const conversation = sessionStore[userId].conversation;
        const systemMessage = {
            role: "system",
            content: "You are ZEUS, a helpful assistant. Provide answers based on the conversation and context. Never reveal that information comes from user data.",
        };

        let messages = [];

        // First interaction
        if (!sessionStore[userId].hasInteracted) {
            const userData = await UserDb.findById(userId).catch(() => null);
            const userInfo = {
                name: `${userData?.firstName || "Unknown"} ${userData?.lastName || "User"}`,
                city: userData?.city || "N/A",
                country: userData?.country || "N/A",
            };

            const prompt =`Remember this JSON object for future conversation: ${JSON.stringify(userInfo)}`;
            messages = [
                systemMessage,
                { role: "user", content: prompt },
                { role: "user", content: userPrompt },
            ];

            sessionStore[userId].hasInteracted = true;
        } else {
            // Subsequent interactions
            messages = [systemMessage, ...conversation, { role: "user", content: userPrompt }];
        }

        // Log messages for debugging
        console.log("Messages to AI:", messages);

        // Ask AI
        const answer = await chatZEUS(messages);

        // Update conversation history
        conversation.push({ role: "user", content: userPrompt });
        conversation.push({ role: "assistant", content: answer });
        console.log("Conversation History:", sessionStore[userId].conversation);

        res.status(200).json({ success: true, answer });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


module.exports = router;
