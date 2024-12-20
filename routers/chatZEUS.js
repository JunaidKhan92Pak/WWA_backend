const express = require("express");
const { chatZEUS } = require("../controller/aiController");
const authenticateAiToken = require("../middlewares/authAi");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const University = require("../database/models/universtyDB");
const studentPreference = require("../database/models/userPreference");
const { getUserData } = require("../controller/getUserData");

const sessionStore = {}; // Consider Redis for production
router.post("/", authenticateAiToken, async (req, res) => {
  const userPrompt = req.body.userPrompt;
  const userId = req.user?.id;
  const user = await UserDb.findById({ _id: userId }).catch(() => null);
  const userData = {
    name: user.firstName + " " + user.lastName,
    city: user.city,
    country: user.country,
  };
  if (!userPrompt) {
    return res
      .status(400)
      .json({ message: "User Prompt is required", success: false });
  }
  try {
    if (!sessionStore[userId]) {
      sessionStore[userId] = { hasInteracted: false, conversation: [] };
    }
    const userSession = sessionStore[userId];
    let messages = [];
    if (!req.user && userSession.conversation.length >= 5) {
      return res.status(200).json({
        success: true,
        answer:
          "Please log in for better results. Click here: https://world-wide-admission.vercel.app/signin",
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
              { role: "user", content: userPrompt },
              {
                role: "assistant",
                content: `I found some universities in ${studentPreferred.perferredCountry}:\n${universityDetails} tell user about this University and its website link .Your Answer should be simple and short `,
              }
            );
            console.log(JSON.stringify(messages) + "message to ai ");
          } else {
            // No universities found in preferred country
            messages.push(
              { role: "user", content: userPrompt },
              {
                role: "assistant",
                content: `Just ask from user Would you like to explore another country?.Answer should be short and simple`,
              }
            );
            console.log(messages + "message to ai login user with no country");
          }
        } else {
          // No preferred country found
          messages.push(
            { role: "user", content: userPrompt },
            {
              role: "assistant",
              content:
                "Ask User Which country are you interested in for study?.Answer should be short and simple",
            }
          );
          console.log(messages + "message to ai  by non login user");
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
        messages.push({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again later.",
        });
      }
    } else if (/study in uk|uk|canada|usa/i.test(userPrompt)) {
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
              { role: "user", content: userPrompt },
              {
                role: "assistant",
                content: `I found some universities in ${studentPreferred.perferredCountry}:\n${universityDetails} tell user about this University and its website link .Your Answer should be simple and short `,
              }
            );
            console.log(JSON.stringify(messages) + "message to ai ");
          } else {
            // No universities found in preferred country
            messages.push(
              { role: "user", content: userPrompt },
              {
                role: "assistant",
                content: `Just ask from user Would you like to explore another country?.Answer should be short and simple`,
              }
            );
            console.log(messages + "message to ai login user with no country");
          }
        } else {
          // No preferred country found
          messages.push(
            { role: "user", content: userPrompt },
            {
              role: "assistant",
              content:
                "Which country are you interested in for study?.Answer should be short and simple",
            }
          );
          console.log(messages + "message to ai  by non login user");
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
        messages.push({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again later.",
        });
      }
      // messages.push({
      //   role: "assistant",
      //   content:
      //     "Which program are you interested in?.Answer should be short and simple",
      // });
    } else if (/ai|ai program/i.test(userPrompt)) {
      const universities = await University.find({ "programs.name": "AI" });
      if (universities.length) {
        messages.push({
          role: "assistant",
          content: `Here are universities offering AI programs:\n${universities
            .map((u) => `- ${u.name}, Link: ${u.websiteLink}`)
            .join(
              "\n"
            )}.Tell the names and webite links of these universities.The answer should be short and simple`,
        });
      } else {
        messages.push({
          role: "assistant",
          content: "Sorry, no universities found offering AI programs.",
        });
      }
    } else {
      messages.push({
        role: "user",
        content: userPrompt,
      });
    }
    console.log(messages);

    const answer = await chatZEUS(messages, userData);
    userSession.conversation.push({ role: "user", content: userPrompt });
    // userSession.conversation.push({ role: "assistant", content: answer });
    res.status(200).json({ success: true, answer });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
