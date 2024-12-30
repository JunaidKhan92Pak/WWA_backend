const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chatZEUS = async (messages, userData, universities) => {
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
          content: "You are ZEUS, a helpful and concise assistant. Provide accurate, simple, and user-friendly answers. Do not mention or reveal that responses are based on preloaded user or university data."
        },
        {
          role: "assistant",
          content: `Preloaded data: 
          - Universities: ${JSON.stringify(universities)} 
          - User Data: ${JSON.stringify(userData)}.          
          Use this data to respond to user inquiries. If no university data is found or User tell you about University then tell few university  and ask  user about their preferences (e.g., country or specific university) and redirect them to visit this link for more information: [http://localhost:3000/countrypage].`
        },
        ...messages,
      ],
    });

    const answer =
      completion.choices[0]?.message?.content || "No response from AI.";
    return answer;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      console.error("OpenAI API error:", error.response.data);
    } else {
      console.error("Server error:", error.message);
    }
    return "An error occurred while processing your request. Please try again later.";
  }
};

module.exports = { chatZEUS };