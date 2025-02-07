import React, {
    useState,
    useCallback,
    FormEvent,
    KeyboardEvent,
    useRef,
    useEffect,
} from 'react';
import useChat from './hooks/useChat';
import { MdArrowUpward, MdStop } from 'react-icons/md';
import styles from './styles/styles.module.css';

const Chatbot = () => {
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const isAtBottomRef = useRef(true);

    const { messages, sendMessage, cancelStream, loading } = useChat({
        apiUrl: 'http://localhost:8080/chat',
    });

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();

            const trimmedInput = input.trim();
            if (!trimmedInput) return;

            sendMessage(trimmedInput);
            setInput('');
        },
        [input, sendMessage]
    );

    const handleKeyPress = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as FormEvent);
            }
        },
        [handleSubmit]
    );

    const handleScroll = useCallback(() => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } =
            chatContainerRef.current;
        isAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 10;
    }, []);

    useEffect(() => {
        if (isAtBottomRef.current) {
            requestAnimationFrame(() => {
                chatContainerRef.current?.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                });
            });
        }
    }, [messages]);

    return (
        <section className={styles.container}>
            <div
                className={styles.messages}
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
                {messages.map((msg, index) => {
                    return (
                        <p
                            key={index}
                            className={
                                msg.role === 'user'
                                    ? styles.userMessage
                                    : styles.aiMessage
                            }
                        >
                            {msg.content}
                        </p>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className={styles.chatForm}>
                <div className={styles.chatInput}>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Send Message..."
                    />
                </div>

                <div className={styles.chatButtons}>
                    {loading ? (
                        <button
                            type="button"
                            onClick={cancelStream}
                            aria-label="Cancel AI Response"
                        >
                            <MdStop size={18} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            aria-label="Send Message"
                            disabled={!input.trim()}
                        >
                            <MdArrowUpward size={18} />
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
};

export default Chatbot;
