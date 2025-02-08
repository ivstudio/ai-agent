import cors from 'cors';
import express from 'express';
import { OpenAI } from 'openai';

import 'dotenv/config';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /chat - Handles chat messages and streams AI responses.
 */
app.post('/chat', async (req, res) => {
    try {
        console.log('Incoming Request:', JSON.stringify(req.body, null, 2));

        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res
                .status(400)
                .json({ error: 'Invalid request: messages array is required' });
        }

        const stream = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(port, () =>
    console.log(`✅ Server running at http://localhost:${port}`)
);
