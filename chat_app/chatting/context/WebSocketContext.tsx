import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useSession } from './AuthContext';

interface WebSocketContextType {
    ws: WebSocket | null;
}

const WebSocketContext = createContext<WebSocketContextType>({ ws: null });

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session } = useSession()
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const initializeWebSocket = async () => {
            if (session == null) return
            const token = await SecureStore.getItemAsync("token");
            const socket = new WebSocket(`ws://${process.env.EXPO_PUBLIC_API_URL}?token=${token}`);

            socket.onopen = () => {
                console.log('WebSocket connection opened');
            };

            socket.onclose = () => {
                console.log('WebSocket connection closed');
            };

            setWs(socket);
        }

        initializeWebSocket()

        return () => {
            console.log("Cleaning up WebSocket...")
            ws?.close();
        };
    }, [session]);

    return (
        <WebSocketContext.Provider value={{ ws }}>
            {children}
        </WebSocketContext.Provider>
    );
};
