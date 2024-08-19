import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';
import { gql, useMutation } from '@apollo/client';
import ReactMarkdown from 'react-markdown';

const GET_ANSWER = gql`
  mutation GetAnswer($question: String!) {
    getAnswer(question: $question)
  }
`;

const starterQuestions = [
    "Outline the sections of the city code.",
    "What are the snow removal rules?",
    "Does the city code cover noise regulations?",
    "What are the requirements for building permits?",
    "How are public events regulated in the city?"
];

const HomePage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const [getAnswer, { data, loading, error }] = useMutation(GET_ANSWER);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            const userMessage = { text: input, sender: 'user' };
            setMessages([...messages, userMessage]);

            try {
                const { data } = await getAnswer({ variables: { question: input } });

                const cleanedText = data.getAnswer.replace(/【\d+†source】/g, '');
                const botMessage = { text: formatBotResponse(cleanedText), sender: 'bot' };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (err) {
                console.error("Error fetching the answer:", err);
                const errorMessage = { text: "Sorry, there was an error processing your request.", sender: 'bot' };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            } finally {
                setInput('');
            }
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const formatBotResponse = (text) => {
        return <ReactMarkdown>{text}</ReactMarkdown>;
    };

    const handleStarterQuestionClick = (question) => {
        setInput(question);
    };

    return (
        <div className="homepage">
            <header className="header">
                <h1>Trinidad Municipal Code Assistant</h1>
            </header>

            <section className="description">
                <h2>About This Service</h2>
                <p>
                    Welcome to the Trinidad Municipal Code Assistant, a chat-based interface designed to help you
                    navigate and understand the city’s municipal codes. Powered by OpenAI's GPT-4, this tool allows you
                    to ask questions about local laws, ordinances, and regulations, and receive instant answers.
                </p>
                <p>
                    This assistant leverages advanced AI technology to interpret and present relevant sections of the
                    municipal code. While the AI strives to provide accurate and up-to-date information, please note
                    that it may not always reflect the latest legal changes or interpretations.
                </p>
                <p>
                    <strong>Disclaimer:</strong> The information provided by this service is for general informational purposes only and does not constitute legal advice. The City of Trinidad, the developers, and any associated parties are not responsible for any errors or omissions in the content. For specific legal concerns, please consult a qualified attorney or the appropriate government officials.
                </p>
            </section>

            <section className="starter-questions">
                <h3>Starter Questions</h3>
                <ul>
                    {starterQuestions.map((question, index) => (
                        <li key={index} onClick={() => handleStarterQuestionClick(question)}>
                            {question}
                        </li>
                    ))}
                </ul>
            </section>

            <div className="chat-interface">
                <div className="messages-area">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender}`}>
                            {message.sender === 'bot' ? message.text : <p>{message.text}</p>}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question here..."
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Send"}
                    </button>
                </form>
                {error && <p className="error">Error: {error.message}</p>}
            </div>
        </div>
    );
};

export default HomePage;
