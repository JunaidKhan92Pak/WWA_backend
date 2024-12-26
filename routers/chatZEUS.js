const express = require("express");
const router = express.Router();
const authenticateAiToken = require("../middlewares/authAi");
const University = require("../database/models/universtyDB");
const  getUserData  = require("../controller/getUserDb");
const { chatController } = require("../controller/chatController");

const sessionStore = {}; // Consider Redis for production
router.post("/", authenticateAiToken, async (req, res) => {
  const userPrompt = req.body.userPrompt;
  const userId = req.user?.id;
  const user = await getUserData(userId);
  let universities;
  console.log("user", user);
  if (user?.preferdCountry) {
    universities = await University.find({
      country: user.preferdCountry
    });
  }

  if(!userPrompt){
     return res.status(200).json({succes:false , answer:"Please enter a message"})
  }
  try {
    if (!sessionStore[userId]) {
      sessionStore[userId] = { hasInteracted: false, conversation: [] };
    }

    const userSession = sessionStore[userId];
    if (!req.user && userSession.conversation.length >= 5) {
      return res.status(200).json({
        success: true,
        answer:
          "Please log in for better results. Click here: https://world-wide-admission.vercel.app/signin",
      });
    }

    else{
      const answer = await chatController(userPrompt, user, universities);
      res.status(200).json({ success: true, answer });
    }
    userSession.conversation.push({ role: "user", content: userPrompt });
  } 
  catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;
