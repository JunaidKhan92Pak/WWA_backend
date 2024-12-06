const  OpenAI =  require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
const askAI = async ( messages)=> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
  });
    const answer = completion.choices[0].message.content;
    return answer;
  }
  catch(error){
     console.log(`There Is Some ${error}`);
     
  }
}

module.exports = {askAI}