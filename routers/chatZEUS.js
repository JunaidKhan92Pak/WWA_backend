const express = require("express");
const { chatZEUS } = require("../controller/aiController");
const authenticateAiToken = require("../middlewares/authAi");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const University = require("../database/models/universtyDB");
const studentPreference = require("../database/models/userPreference");
const sessionStore = {}; // Consider Redis for production

router.post("/", authenticateAiToken, async (req, res) => {
  const userPrompt = req.body.userPrompt;
  const userId = req.user?.id;

  if (!userPrompt) {
    return res
      .status(400)
      .json({ message: "User Prompt is required", success: false });
  }

  try {
    const systemMessage = {
      role: "system",
      content:
        "You are ZEUS, a helpful assistant. Provide answers based on the conversation and context. Never reveal that information comes from user data.",
    };

    if (!sessionStore[userId]) {
      sessionStore[userId] = { hasInteracted: false, conversation: [] };
    }

    const userSession = sessionStore[userId];
    let messages = [systemMessage, ...userSession.conversation];

    if (!req.user && userSession.conversation.length >= 10) {
      return res.status(200).json({
        success: true,
        answer:
          "Please log in for better results. Click here: http://localhost:3000/signin",
      });
    }
    if (
      /country for study|study abroad|university abroad|abroad study/i.test(
        userPrompt
      )
    ) {
      try {
        // Fetch user preferences
        const studentPreferred = await studentPreference.findOne({
          user: userId,
        });

        if (studentPreferred?.perferredCountry) {
          // Fetch universities based on preferred country
          const universities = await University.find({
            country: studentPreferred.perferredCountry,
          });

          if (universities.length) {
            // Format university details
            const universityDetails = universities
              .map((uni) => `- ${uni.name}, Website: ${uni.websiteLink}`)
              .join("\n");
            messages.push(
              {
                role: "assistant",
                content: `I found some universities in ${studentPreferred.perferredCountry}:\n${universityDetails}`,
              },
              { role: "user", content: userPrompt }
            );
          } else {
            // No universities found in preferred country
            messages.push(
              {
                role: "assistant",
                content: `It seems there are no universities listed in ${studentPreferred.perferredCountry}. Would you like to explore another country?`,
              },
              { role: "user", content: userPrompt }
            );
          }
        } else {
          // No preferred country found
          messages.push(
            {
              role: "assistant",
              content: "Which country are you interested in for study?",
            },
            { role: "user", content: userPrompt }
          );
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
        messages.push({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again later.",
        });
      }
    } else if (/study in uk/i.test(userPrompt)) {
      messages.push({
        role: "assistant",
        content: "Which program are you interested in?",
      });
    } else if (/ai|program/i.test(userPrompt)) {
      const universities = await University.find({ "programs.name": "AI" });
      if (universities.length) {
        messages.push({
          role: "assistant",
          content: `Here are universities offering AI programs:\n${universities
            .map((u) => `- ${u.name}, Link: ${u.websiteLink}`)
            .join("\n")}`,
        });
      } else {
        messages.push({
          role: "assistant",
          content: "Sorry, no universities found offering AI programs.",
        });
      }
    }

    const answer = await chatZEUS(messages);

    userSession.conversation.push({ role: "user", content: userPrompt });
    userSession.conversation.push({ role: "assistant", content: answer });
    res.status(200).json({ success: true, answer });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
