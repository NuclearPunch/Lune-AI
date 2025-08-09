import { useEffect, useRef, useCallback, useState } from "react";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  sendMessage: (message: WebSocketMessage) => void;
  readyState: number;
  isConnected: boolean;
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);

  const connect = useCallback(() => {
    try {
      // Determine the correct protocol and construct WebSocket URL
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}${url}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setReadyState(WebSocket.OPEN);
        reconnectCountRef.current = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          onMessage?.(event.data);
        }
      };

      ws.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        onClose?.();

        // Attempt to reconnect if not a manual close and we have attempts left
        if (!event.wasClean && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        setReadyState(WebSocket.CLOSED);
        onError?.(error);
        console.error("WebSocket error:", error);
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setReadyState(WebSocket.CLOSED);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectAttempts, reconnectInterval]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
      }
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message);
    }
  }, []);

  useEffect(() => {
    connect();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        // Close with code 1000 (normal closure) to prevent reconnection
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [connect]);

  return {
    sendMessage,
    readyState,
    isConnected: readyState === WebSocket.OPEN,
  };
}
