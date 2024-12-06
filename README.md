# Intro

This directory contains a simple LangGraph. This directory contains a single graph, located inside the `index.ts` file.

- [Intro](#intro)
  - [Setup](#setup)
  - [Environment variables](#environment-variables)
    - [LangGraph Config](#langgraph-config)
    - [Tavily](#tavily)
  - [Editing the project](#editing-the-project)
    - [Code Regions](#code-regions)
  - [Running the project](#running-the-project)

## Setup

To set up the intro project, install the dependencies:

```bash
yarn install
```

## Environment variables

The intro project requires Tavily and OpenAI API keys to run. Sign up here:

- [OpenAI](https://platform.openai.com/signup)
- [Tavily](https://tavily.com/)

Once you have your API keys, create a `.env` file in this directory and add the following:

```bash
TAVILY_API_KEY=YOUR_API_KEY
OPENAI_API_KEY=YOUR_API_KEY
```

### LangGraph Config

The LangGraph configuration file for the intro project is located inside [`langgraph.json`](langgraph.json). This file defines the single graph implemented in the project: `simple_agent`.

### Tavily

Follow these steps to obtain access to the Tavily API:

1. **Sign Up**
   - Go to [Tavily's official website](https://tavily.com/) and create an account.
   - Verify your email address to complete the registration process.

2. **Access the Dashboard**
   - Once logged in, navigate to the **Dashboard**.
   - Here, you can manage your API keys, monitor usage, and configure settings.

3. **Generate Your API Key**
   - Go to the **API Keys** section in the dashboard.
   - Click on **Generate API Key** to create a new API key.
   - Copy the API key, as you will need it for all API requests.

## Editing the project

To edit the project, open the `index.ts` file and make changes to the graph.

### Code Regions

1. **Imports**

    This section imports necessary modules and components from `@langchain/langgraph`, `@langchain/core/messages`, and `model.js`.

    ```typescript
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
    ```

    Look at `model.js`, it contains the model that will be used in the graph. We are using the Groq API.

2. **Tools**

    ```typescript
    const webSearchTool = new TavilySearchResults({
      maxResults: 4,
    });
    const tools = [webSearchTool];
    const toolNode = new ToolNode(tools as any);
    ```

    - Initializes a web search tool with a maximum of 4 results.
    - Creates a `ToolNode` with the initialized tools.

3. **Model**

    ```typescript
    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const { messages } = state;
      const llmWithTools = model.bindTools(tools);
      const result = await llmWithTools.invoke(messages);
      return { messages: [result] };
    };
    ```

    - Defines an asynchronous function `callModel` that binds tools to the model and invokes it with the current messages.

4. **Conditionals**

    ```typescript
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
    ```

    - Defines a function `shouldContinue` to determine whether the workflow should continue or end based on the last message.

5. **Graph**

    ```typescript
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode("agent", callModel)
      .addEdge(START, "agent")
      .addNode("tools", toolNode)
      .addEdge("tools", "agent")
      .addConditionalEdges("agent", shouldContinue, ["tools", END]);

    export const graph = workflow.compile({
      // Uncomment if running locally
      // checkpointer: new MemorySaver(),
    });
    graph.name = "graph";
    ```

    - Creates a `StateGraph` with nodes and edges, defining the workflow of the graph.

6. **Draw Graph**

    ```typescript
    import { saveGraphAsImage } from "drawGraph.js";
    await saveGraphAsImage(graph);
    ```

    - Imports a function to save the graph as an image and calls it.

7. **Usage**

    ```typescript
    const agentFinalState = await graph.invoke(
      { messages: [new HumanMessage("what is the current weather in sf")] },
      { configurable: { thread_id: "42" } },
    );

    console.log(
      agentFinalState.messages[agentFinalState.messages.length - 1].content,
    );

    const agentNextState = await graph.invoke(
      { messages: [new HumanMessage("what about ny")] },
      { configurable: { thread_id: "42" } },
    );

    console.log(
      agentNextState.messages[agentNextState.messages.length - 1].content,
    );
    ```

    - Demonstrates how to invoke the graph with initial messages and log the final state messages.

## Running the project

To run the intro project, use the following commands:

```bash
yarn install
yarn run build
yarn run start
```