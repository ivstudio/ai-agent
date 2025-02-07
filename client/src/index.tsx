import React from 'react';
import ReactDOM from 'react-dom/client';
import Chatbot from 'Chatbot';

const element = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(element);

root.render(
    <React.StrictMode>
        <Chatbot />
    </React.StrictMode>
);
