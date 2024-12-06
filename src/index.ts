
// code here
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { model } from "model.js";
import { Calculator } from "@langchain/community/tools/calculator";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const webSearchTool = new TavilySearchResults({
    maxResults: 4,
  });

//#region tools
const todayDateTimeSchema = z.object({
  timeZone: z.string().describe("Time Zone Format"),
  locale: z.string().describe("Locale string")
});

function getTodayDateTime({timeZone, locale}: { timeZone: string; locale: string }) {
  //const timeZone = 'America/Chicago';
  //const locale = 'en-US';
  console.log("Getting today's date and time in " + timeZone + " timezone");
  const today = new Date();
  const formattedDate = today.toLocaleString(locale, {
      timeZone: timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  const result = {
      "formattedDate": formattedDate,
      "timezone": timeZone
  };
  console.log(result)
  return JSON.stringify(result);
}

const dateTool = tool(
  ({timeZone, locale}) => {
    return getTodayDateTime({timeZone, locale});
  },
  {
    name: "todays_date_time",
    description:
      "Useful to get current day, date and time.",
    schema: todayDateTimeSchema,
  }
);

//console.log(await dateTool.invoke({timeZone: 'America/New_York', locale: 'en-US'}));

const calculator = new Calculator();
const tools = [dateTool, calculator, webSearchTool];
const toolNode = new ToolNode(tools as any);
//#endregion


const callModel = async (state: typeof MessagesAnnotation.State) => {
    const { messages } = state;
    const llmWithTools = model.bindTools(tools);
    const result = await llmWithTools.invoke(messages);
    return { messages: [result] };
};

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage._getType() !== "ai" ||
      !(lastMessage as AIMessage).tool_calls?.length
    ) {
      return END;
    }
    return "tools";
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END]);

export const graph = workflow.compile({
  // Uncomment if running locally
  // checkpointer: new MemorySaver(),
});
graph.name = "graph";

import { saveGraphAsImage } from "drawGraph.js";
await saveGraphAsImage(graph);

const agentFinalState = await graph.invoke(
    { messages: [new HumanMessage("what is the current time and weather in Dallas?")] },
    { configurable: { thread_id: "42" } },
  );
  
console.log(
  //agentFinalState.messages
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);
  
//   const agentNextState = await graph.invoke(
//     { messages: [new HumanMessage("what about ny")] },
//     { configurable: { thread_id: "42" } },
//   );
  
//   console.log(
//     agentNextState.messages[agentNextState.messages.length - 1].content,
//   );