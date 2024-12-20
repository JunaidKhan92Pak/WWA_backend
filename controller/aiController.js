const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const UserDb = require("../database/models/UserDb");
const chatZEUS = async (messages, userData) => {
  console.log(userData);
  try {
    // Ensure messages is an array
    if (!Array.isArray(messages)) {
      throw new Error("Invalid messages format. Expected an array.");
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are ZEUS, a helpful assistant. Provide the latest and simplest answers.never reveal that the information was sourced from the user data.",
        },
        {
          role: "assistant",
          content:
            JSON.stringify(userData) +
            "This is user data in json format.Respond to user according to this data",
        },
        ...messages,
      ],
    });

    const answer =
      completion.choices[0]?.message?.content || "No response from AI.";
    return answer;
  } catch (error) {
    console.error("Error communicating with OpenAI:", error.message);
    return "An error occurred while processing your request. Please try again later.";
  }
};

module.exports = { chatZEUS };