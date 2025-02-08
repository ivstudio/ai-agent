# AI Chatbot POC

This is a POC for an AI chatbot built with React and Express.

## Key Features

- HTTP Streaming.
- Live Message Cancellation – Stop AI responses mid-stream if needed.
- Message Role Support – Maintains structured chat roles (user, assistant, system).
- Typing Indicator – Displays a loading state while AI is generating a response.
- Auto-Scrolling – Keeps the chat scrolled to the latest message.
- Fully Customizable UI
- Submit messages using the Enter key or submit button.
- Send messages to the AI agent via a controlled input field


## Stack

- Frontend: React + TypeScript
- Backend: Express.js
- AI: OpenAI API

## 🚀Getting Started

1. `npm install`
2. `cd client && npm install`
3. `cd server && npm install`
4. Add your OpenAI API key to `server/.env`.

### Run Dev Mode

Start the project in dev mode, **navigate to the root directory** and run: `npm run dev`.
This will launch both the server and client.