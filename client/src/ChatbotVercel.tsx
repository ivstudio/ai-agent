import React from 'react';
import { useChat } from 'ai/react';

const ChatbotVercel = () => {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: 'http://localhost:8080/chat',
        headers: { 'Content-Type': 'application/json' },
    });

    return (
        <section>
            <h1>AI Chatbot Vercel</h1>

            {messages.map(message => (
                <div key={message.id}>
                    {message.role === 'user' ? 'User: ' : 'AI: '}
                    {message.content}
                </div>
            ))}

            <form onSubmit={handleSubmit}>
                <input
                    name="prompt"
                    value={input}
                    onChange={handleInputChange}
                />
                <button type="submit">Submit</button>
            </form>
        </section>
    );
};

export default ChatbotVercel;
