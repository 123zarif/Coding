require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const db = new Pool({
    user: 'server',
    host: 'localhost',
    database: 'chat',
    password: '1234',
    port: 5432,
});

app.post("/verify_token", (req, res) => {
    const func = async () => {
        try {
            const { token } = req.body;

            if (token) {
                const tokenData = await db.query("SELECT * FROM tokens WHERE token = $1", [token])

                if (tokenData.rows.length === 0) {
                    return res.status(401).json({ success: false, message: "Invalid token" });
                }

                jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                    if (err) {
                        return res.status(401).json({ success: false, message: "Invalid token" });
                    }

                    return res.json({ success: true, id: user.id, name: user.name, token: token });
                });
            } else {
                return res.status(401).json({ success: false, message: "No token provided" });
            }
        } catch {
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }

    func();
})

app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error("Token verification failed:", err);
                return next();
            }
            req.userid = user.id;
            req.name = user.name;
            next();
        });
    } else {
        next();
    }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });





app.post('/login', (req, res) => {
    const func = async () => {
        const { username, password } = req.body;

        try {
            if (req.userid) {
                return res.status(400).json({ success: false, message: "Already logged in" });
            }


            const result = await db.query('SELECT * FROM users WHERE name = $1', [username]);
            if (result.rows.length > 0) {
                const match = await bcrypt.compare(password, result.rows[0].password);

                if (!match) {
                    return res.status(401).json({ success: false, message: "Invalid credentials" });
                }

                const token = await jwt.sign({ id: result.rows[0].id, name: result.rows[0].name }, process.env.JWT_SECRET, { expiresIn: '15d' });


                await db.query("INSERT INTO tokens (userid, token) VALUES ($1, $2)", [result.rows[0].id, token])


                return res.json({ success: true, message: "Login successful", id: result.rows[0].id, name: result.rows[0].name, token: token });
            } else {
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        } catch (err) {
            console.error("Error during login:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    func();
});

app.get("/hash/:text", async (req, res) => {
    const { text } = req.params;
    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(text, saltRounds);
        console.log(hash);
        res.json({ hash });
    } catch (err) {
        res.status(500).json({ error: "Error generating hash" });
    }
})

app.get('/messages', (req, res) => {
    const func = async () => {
        try {
            if (!req.userid) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const msg = await db.query('SELECT messages.*, users.name, users.pfp FROM messages LEFT JOIN users ON messages.userid = users.id ORDER BY messages.id DESC LIMIT 50')

            return res.json({ success: true, messages: msg.rows });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Server error" });
        }

    }

    func();
});


wss.on('connection', (ws, req) => {
    const token = new URLSearchParams(req.url.split('?')[1]).get('token')

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            ws.close();
            return console.error("Websocket authentication failed");
        }
        ws.userid = user.id;
        ws.name = user.name;
    });

    ws.on('message', (message) => {
        if (!ws.userid) return;

        try {
            const data = JSON.parse(message);

            if (data.event === "sendMsg") {
                if (!data.data || !data.type) return
                db.query("insert into messages (userid, data, type) values ($1, $2, $3)", [ws.userid, data.data, data.type], (err, res) => {
                    if (err) {
                        console.error(err);
                        return
                    } else {
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: "text", data: data.data, userid: ws.userid, name: ws.name }))
                            }
                        })

                        return;
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