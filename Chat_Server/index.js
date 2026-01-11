const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const pool = new Pool({
    user: 'server',
    host: 'localhost',
    database: 'chat',
    password: '1234',
    port: 5432,
});


wss.on('connection', (ws) => {
    const func = async () => {
        pool.query("select * from messages", (err, res) => {
            if (err) {
                console.error(err);
            } else {
                // Send the DB rows to your Quickshell client
                ws.send(JSON.stringify({ res: res.rows }));
            }
        })

    }

    func();

    ws.send('Welcome to the Node.js Server!');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.event === "sendMsg") {
                pool.query("insert into messages (data, type) values ($1, $2)", [data.data, "text"], (err, res) => {
                    if (err) {
                        console.error(err);
                    } else {
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: "text", msg: data.data, msgType: "text" }))
                            }
                        })
                    }
                })
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(8080, () => {
    console.log("Server started on port 8080");
});