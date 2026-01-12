import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface WebSocketContextType {
    ws: WebSocket | null;
}

const WebSocketContext = createContext<WebSocketContextType>({ ws: null });

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://192.168.31.185:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InphcmlmIiwiaWF0IjoxNzY4MjE4OTk1LCJleHAiOjE3Njk1MTQ5OTV9.Wp7pkyMV1pF2SxsByiWeTWAUTO7QyKgiZoAxDeQ7-Tg');

        socket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ ws }}>
            {children}
        </WebSocketContext.Provider>
    );
};
