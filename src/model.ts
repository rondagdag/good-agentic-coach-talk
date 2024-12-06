const { ChatOpenAI } = await import("@langchain/openai");
export const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  apiKey: process.env.GITHUB_OPENAI_API_KEY,
  configuration: {
    baseURL: 'https://models.inference.ai.azure.com'
  }
});


import { initChatModel } from "langchain/chat_models/universal";
// export const model : any = await initChatModel(undefined, {
//   modelProvider: "groq",
//   temperature: 0,
// });

// export const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });
// export const model = await initChatModel("gpt-4", {
//   modelProvider: "azure_openai",
//   temperature: 0,
// });
// export const model = await initChatModel("gpt-4o", {
//   modelProvider: "openai",
//   temperature: 0,
// });
// export const model : any = await initChatModel(undefined, {
//   modelProvider: "groq",
//   temperature: 0,
// });

