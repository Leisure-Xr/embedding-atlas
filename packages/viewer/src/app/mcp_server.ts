// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import { type JSONSchema7 } from "json-schema";
import { writable, type Readable, type Writable } from "svelte/store";
import { ReconnectingWebSocket } from "./reconnecting_websocket.js";

/** 与即将推出的 navigator.modelContext API 当前设计相对应的类型。 */
export interface ModelContextAPI {
  provideContext(context: MCPContext): void;

  readonly connectionStatus?: Readable<"connecting" | "connected" | "closed" | "error">;
}

export interface MCPContext {
  tools?: MCPTool[];
}

/** 工具定义接口。 */
export interface MCPTool {
  /** 工具的唯一名称。 */
  name: string;

  /** 工具标题。 */
  title?: string;

  /** 工具作用的自然语言描述。 */
  description: string;

  /** 定义输入参数的 JSON Schema。 */
  inputSchema: JSONSchema7;

  /** 定义输出参数的 JSON Schema。 */
  outputSchema?: JSONSchema7;

  /** 实现工具并返回结果的函数。 */
  execute: (input: any, agent: unknown) => Promise<ToolResponse>;
}

/** 工具响应格式。 */
export interface ToolResponse {
  content: Array<{
    type: "text" | "image" | "video";
    text?: string;
    url?: string;
    [key: string]: any;
  }>;
  isError?: boolean;
}

interface WSRequest {
  id: string;
  request: JSONRPCRequest | JSONRPCRequest[];
}

interface WSResponse {
  id: string;
  response: JSONRPCResponse | JSONRPCResponse[];
}

interface JSONRPCRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, any>;
}

interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: number;
  result?: any;
  error?: any;
}

export class MCPWebSocketServer implements ModelContextAPI {
  private tools: MCPTool[];
  private toolsMap: Map<string, MCPTool>;
  private ws: ReconnectingWebSocket;

  connectionStatus: Writable<"connecting" | "connected" | "closed" | "error">;

  constructor(endpoint: string) {
    this.tools = [];
    this.toolsMap = new Map();
    this.connectionStatus = writable("connecting");

    this.ws = new ReconnectingWebSocket(endpoint, {
      onMessage: async (event) => {
        try {
          const data = JSON.parse(event.data);

          // Check for control messages
          if (data.control === "close") {
            this.ws.close();
            return;
          }

          // Handle normal MCP requests
          const request: WSRequest = data;
          const response = await this.processRequest(request);
          this.ws.send(JSON.stringify(response));
        } catch (error) {
          console.error("处理 MCP 请求时出错：", error);
        }
      },
      onStatus: (value) => {
        this.connectionStatus.set(value);
      },
    });
  }

  public close(): void {
    this.ws.close();
  }

  provideContext(context: MCPContext) {
    this.tools = context.tools ?? [];
    this.toolsMap = new Map(this.tools.map((tool) => [tool.name, tool]));
  }

  private async processRequest(request: WSRequest): Promise<WSResponse> {
    if (request.request instanceof Array) {
      let responses: JSONRPCResponse[] = [];
      for (let req of request.request) {
        responses.push(await this.processRPC(req));
      }
      return { id: request.id, response: responses };
    } else {
      return { id: request.id, response: await this.processRPC(request.request) };
    }
  }

  private async processRPC(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    let result: any;
    let error: any;
    try {
      result = await this.rpc(request.method, request.params ?? {});
    } catch (e: any) {
      error = { code: -32603, message: e.toString() };
    }
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: result,
      error: error,
    };
  }

  private async rpc(method: string, params: any): Promise<any> {
    switch (method) {
      case "initialize":
        return await this.initialize(params);
      case "tools/list":
        return await this.toolsList(params);
      case "tools/call":
        return await this.toolsCall(params);
      default:
        throw new Error(`方法 ${method} 未实现`);
    }
  }

  async initialize(params: { clientInfo: { name: string } }) {
    console.info("MCP 初始化", params.clientInfo);
    return {
      protocolVersion: "2024-11-05",
      capabilities: {
        logging: {},
        prompts: {},
        resources: {},
        tools: {},
        tasks: {},
      },
      serverInfo: {
        name: "Embedding Atlas",
        title: "Embedding Atlas MCP 服务器",
        version: "1.0.0",
        description: "用于 Embedding Atlas 前端的 MCP 服务器",
        icons: [
          {
            src: "https://apple.github.io/embedding-atlas/favicon.svg",
            mimeType: "image/svg+xml",
            sizes: ["any"],
          },
        ],
        websiteUrl: "https://apple.github.io/embedding-atlas",
      },
      instructions: "客户端可使用的可选说明",
    };
  }

  async toolsList(params: {}) {
    let resultTools = this.tools.map((tool) => ({
      name: tool.name,
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
    }));

    return { tools: resultTools };
  }

  async toolsCall(params: { name: string; arguments: any }): Promise<ToolResponse> {
    let tool = this.toolsMap.get(params.name);
    if (tool == undefined) {
      throw new Error("未找到工具");
    }
    try {
      return await tool.execute(params.arguments, undefined);
    } catch (e: any) {
      return {
        content: [{ type: "text", text: "异常：" + e.toString() }],
        isError: true,
      };
    }
  }
}
