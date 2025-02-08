import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

interface UseChatStreamProps {
	apiUrl: string;
	headers?: Record<string, string>;
	initialMessages?: Message[];
}

interface UseChatStreamReturn {
	messages: Message[];
	loading: boolean;
	error: string | null;
	sendMessage: (userInput: string) => void;
	cancelStream: () => void;
}

const useChat = ({
	apiUrl,
	headers = {},
	initialMessages = [],
}: UseChatStreamProps): UseChatStreamReturn => {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const messagesRef = useRef<Message[]>(initialMessages);

	/**
	 * Sends a user message and streams AI response.
	 */
	const sendMessage = useCallback(
		async (userInput: string) => {
			if (!userInput.trim() || loading) return;

			setLoading(true);
			setError(null);

			const newUserMessage: Message = {
				role: 'user',
				content: userInput,
			};
			setMessages((prev) => [...prev, newUserMessage]);
			messagesRef.current = [...messagesRef.current, newUserMessage];

			abortControllerRef.current?.abort();
			abortControllerRef.current = new AbortController();

			try {
				const response = await fetch(apiUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', ...headers },
					body: JSON.stringify({ messages: messagesRef.current }),
					signal: abortControllerRef.current.signal,
				});

				if (!response.body) throw new Error('No response body');

				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let aiMessage = '';
				let isStreamingDone = false;

				while (!isStreamingDone) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					const lines = chunk
						.split('\n')
						.filter((line) => line.startsWith('data:'));

					for (const line of lines) {
						try {
							const jsonString = line.substring(5).trim();
							if (jsonString === '[DONE]') {
								isStreamingDone = true;
								break;
							}

							const parsed = JSON.parse(jsonString);
							if (parsed.content) {
								aiMessage += parsed.content;
								setMessages((prev) => {
									const updatedMessages = [...prev];
									const lastMessageIndex =
										updatedMessages.length - 1;

									if (
										updatedMessages[lastMessageIndex]
											?.role === 'assistant'
									) {
										updatedMessages[
											lastMessageIndex
										].content = aiMessage;
									} else {
										updatedMessages.push({
											role: 'assistant',
											content: aiMessage,
										});
									}

									return updatedMessages;
								});
							}
						} catch (error) {
							console.error('JSON Parse Error:', error);
						}
					}
				}

				messagesRef.current = [
					...messagesRef.current,
					{ role: 'assistant', content: aiMessage },
				];
			} catch (err) {
				if ((err as Error).name !== 'AbortError') {
					console.error('Chat Streaming Error:', err);
					setError(
						(err as Error).message ||
							'An error occurred while fetching response.'
					);
				}
			} finally {
				setLoading(false);
			}
		},
		[apiUrl, headers]
	);

	/**
	 * Cancels the ongoing streaming request.
	 */
	const cancelStream = useCallback(() => {
		abortControllerRef.current?.abort();
		setLoading(false);
	}, []);

	/**
	 * Cleanup effect: Cancel request when component unmounts.
	 */
	useEffect(() => () => cancelStream(), [cancelStream]);

	return { messages, loading, error, sendMessage, cancelStream };
};

export default useChat;
