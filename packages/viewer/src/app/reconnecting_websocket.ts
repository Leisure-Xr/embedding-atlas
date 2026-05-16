// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

export interface ReconnectingWebSocketOptions {
  maxReconnectAttempts?: number;
  initialReconnectDelay?: number;
  maxReconnectDelay?: number;
  onMessage: (event: MessageEvent) => void;
  onStatus?: (status: "connecting" | "connected" | "closed" | "error") => void;
}

export class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private endpoint: string;
  private shouldReconnect: boolean = true;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private maxReconnectDelay: number;
  private reconnectTimeoutId: number | null = null;
  private onMessage: (event: MessageEvent) => void;
  private onStatus?: (status: "connecting" | "connected" | "closed" | "error") => void;

  constructor(endpoint: string, options: ReconnectingWebSocketOptions) {
    this.endpoint = endpoint;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.reconnectDelay = options.initialReconnectDelay ?? 1000;
    this.maxReconnectDelay = options.maxReconnectDelay ?? 30000;
    this.onMessage = options.onMessage;
    this.onStatus = options.onStatus;
    this.connect();
  }

  private connect(): void {
    if (!this.shouldReconnect) {
      return;
    }

    this.onStatus?.("connecting");

    try {
      this.ws = new WebSocket(this.endpoint);

      this.ws.onopen = () => {
        console.debug("WebSocket 已连接");
        this.reconnectAttempts = 0;
        this.onStatus?.("connected");
        // 连接成功后将延迟重置为初始值。
      };

      this.ws.onmessage = (event) => {
        this.onMessage(event);
      };

      this.ws.onclose = (event) => {
        console.debug("WebSocket 已关闭：", event.code, event.reason);
        this.ws = null;

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("已达到最大重连次数，停止重连");
          this.onStatus?.("error");
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket 错误：", error);
      };
    } catch (error) {
      console.error("创建 WebSocket 失败：", error);
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      } else {
        this.onStatus?.("error");
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    console.debug(`将在 ${delay}ms 后进行第 ${this.reconnectAttempts} 次重连`);

    this.reconnectTimeoutId = window.setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.connect();
    }, delay);
  }

  public send(data: string): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  public close(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    this.ws?.close();
    this.onStatus?.("closed");
  }
}
