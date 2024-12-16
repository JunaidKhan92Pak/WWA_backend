const express = require("express");
const { chatZEUS } = require("../controller/aiController");
const authenticateAiToken = require("../middlewares/authAi");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const sessionStore = {}; // In-memory session store (consider Redis for production)
const university = require("../database/models/universtyDB");

router.post("/", authenticateAiToken, async (req, res) => {
  const userPrompt = req.body.userPrompt;
  const userId = req.user?.id || `guest_${req.ip}`; // Use a unique key for non-logged-in users

  if (!userPrompt) {
    return res
      .status(400)
      .json({ message: "User Prompt is required", success: false });
  }

  try {
    let messages;
    const systemMessage = {
      role: "system",
      content:
        "You are ZEUS, a helpful assistant. Provide answers based on the conversation and context. Never reveal that information comes from user data.",
    };
    // Initialize session memory for the user if not present
    if (!sessionStore[userId]) {
      sessionStore[userId] = { hasInteracted: false, conversation: [] };
    }

    const userSession = sessionStore[userId];

    // Check interaction limit for non-logged-in users
    if (!req.user && userSession.conversation.length >= 0) {
      console.log("Session Over");
      messages = [
        systemMessage,
        {
          role: "user",
          content: `Tell User to log in to our website WWAH for better results.You can do so by clicking here:http://localhost:3000/signin`,
        },
      ];
    } else {
      if (!sessionStore.hasInteracted) {
        const userData = await UserDb.findById(userId).catch(() => null);
        const studentObject = {
          name: `${userData?.firstName || "Unknown"} ${
            userData?.lastName || "User"
          }`,
          city: userData?.city || "N/A",
          country: userData?.country || "N/A",
        };
        messages = [
          systemMessage,
          {
            role: "user",
            content: userPrompt + " " + JSON.stringify(studentObject),
          },
        ];
        sessionStore.hasInteracted = true;
        console.log("USER" + JSON.stringify(studentObject));
      } else {
        if (
          /student|country for study|university|study|course|program/.test(
            userPrompt.toLowerCase()
          )
        ) {
          const universityData = await university
            .findOne({ name: "Cardiff University" })
            .catch(() => null);
          messages = [
            systemMessage,
            {
              role: "user",
              content:
                universityData +
                " " +
                "tell about this university short and simply with heading and links to User Not in json format",
            },
          ];
        } else {
          messages = [
            systemMessage,
            {
              role: "user",
              content: userPrompt,
            },
          ];
        }
      }
    }

    // Call AI service to get a response
    const answer = await chatZEUS(messages);
    // Update session with user prompt and AI response
    userSession.conversation.push({ role: "user", content: userPrompt });
    res.status(200).json({ success: true, answer });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
