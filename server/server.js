const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3001;
const data = {
    "sample": ["https://example.com"],
    "dog": ["https://dogster.com", "https://dogecoin.com"]
};

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

app.use(cors());

app.get('/api/urls', (req, res) => {
    const keyword = req.query.keyword;
    if (data[keyword]) {
        res.json(data[keyword]);
    } else {
        res.json([]);
    }
});

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'startDownload' && data.payload) {
            const url = data.payload;
            let totalBytes = 0;
            let receivedBytes = 0;

            try {
                const response = await axios.get(url, {
                    responseType: 'stream',
                    onDownloadProgress: progressEvent => {
                        receivedBytes += progressEvent.loaded;
                        if (progressEvent.total) {
                            totalBytes = progressEvent.total;
                        } else {
                            totalBytes = receivedBytes
                        }

                        const progressValue = Math.min(100, Math.floor((receivedBytes / totalBytes) * 100));
                        if (totalBytes) {
                            ws.send(JSON.stringify({
                                type: 'downloadProgress',
                                payload: {
                                    url,
                                    totalSize: totalBytes,
                                    receivedSize: receivedBytes,
                                    progress: progressValue
                                }
                            }));
                        }
                    }
                });

                let content = '';
                response.data.on('data', (chunk) => {
                    content += chunk;
                });

                response.data.on('end', () => {
                    ws.send(JSON.stringify({
                        type: 'downloadComplete',
                        payload: {
                            url,
                            content
                        }
                    }));
                });
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'downloadError',
                    payload: {
                        url,
                        error: "Не удалось скачать контент."
                    }
                }));
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Что-то пошло не так!');
});
