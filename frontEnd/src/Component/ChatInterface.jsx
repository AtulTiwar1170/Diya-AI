import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, Mic, Volume2, StopCircle } from "lucide-react";

const Prompt = () => {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isInitial, setIsInitial] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechRecognition = useRef(null);
    const speechSynthesis = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if ("webkitSpeechRecognition" in window) {
            speechRecognition.current = new window.webkitSpeechRecognition();
            speechRecognition.current.continuous = false;
            speechRecognition.current.interimResults = false;
            speechRecognition.current.lang = "en-US";

            speechRecognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(transcript);
                setIsListening(false);
                handleSubmit(new Event("submit"));
            };

            speechRecognition.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
        }

        // Initialize speech synthesis
        speechSynthesis.current = window.speechSynthesis;

        // Set initial greeting
        setResponse("Hlo I am Diya, How Can I help YOU");
    }, []);

    const startVoiceInput = () => {
        if (speechRecognition.current) {
            setIsListening(true);
            speechRecognition.current.start();
        } else {
            alert("Speech recognition not supported");
        }
    };

    const stopVoiceInput = () => {
        if (speechRecognition.current) {
            setIsListening(false);
            speechRecognition.current.stop();
        }
    };

    const speakResponse = () => {
        if (speechSynthesis.current && response) {
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(response);
            utterance.onend = () => setIsSpeaking(false);
            speechSynthesis.current.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if (speechSynthesis.current) {
            speechSynthesis.current.cancel();
            setIsSpeaking(false);
        }
    };

    const handleChange = (event) => {
        setPrompt(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isInitial) {
            setIsInitial(false);
        }

        if (!prompt.trim()) return;

        try {
            const response = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ prompt: prompt }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            const text = data.response;
            
            //filter text
            // Assuming you're using a text editor that supports HTML-like formatting

function filterGeminiCode(text) {
    // Regex to identify code blocks (adjust as needed based on Gemini's output format)
    const codeBlockRegex = /```([^\n]*)\n([\s\S]*?)\n```/g;
  
    return text.replace(codeBlockRegex, (match, language, code) => {
      return `<pre style="background-color: black; color: white; padding: 10px;">
        <code style="white-space: pre-wrap;">${code}</code>
        <button style="background-color: #4CAF50; color: white; padding: 10px; border: none; cursor: pointer;" onclick="copyToClipboard('${code}')">Copy</button>
      </pre>`;
    });
    
  }
  function processGeminiResponse(text) {
    const filteredText = filterGeminiCode(text);
    setResponse(filteredText);
  }
  processGeminiResponse(text)

        } catch (error) {
            console.error(error);
            setResponse("Error: " + error.message);
        }

        setPrompt("");
    };

    return (
        <div className="flex flex-col h-[89vh] bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex-grow flex justify-center items-center p-4">
                <div className="w-full max-w-3xl h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-slate-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center">
                            <Bot className="mr-3" />
                            <h2 className="text-xl font-bold">DIYA AI Assistant</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isSpeaking ? (
                                <button
                                    onClick={stopSpeaking}
                                    className="text-white hover:text-red-300"
                                >
                                    <StopCircle />
                                </button>
                            ) : (
                                <button
                                    onClick={speakResponse}
                                    className="text-white hover:text-blue-300"
                                    disabled={!response}
                                >
                                    <Volume2 />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Response Area */}
                    <div className="flex-grow overflow-auto p-6">
                        {isInitial ? (
                            <div className="h-full flex items-center justify-center text-2xl text-gray-400 text-center">
                                Hlo I am Diya, How Can I help YOU
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {prompt && (
                                    <div className="flex justify-end mb-4">
                                        <div className="bg-blue-100 p-3 rounded-xl max-w-[80%]">
                                            {prompt}
                                        </div>
                                    </div>
                                )}
                                <div className="flex">
                                    <div className="bg-gray-100 p-3 rounded-xl max-w-[80%]">
                                        {response}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Prompt Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="p-4 border-t border-gray-200 flex items-center"
                    >
                        <div className="flex items-center flex-grow">
                            <input
                                type="text"
                                value={prompt}
                                onChange={handleChange}
                                placeholder="Ask me something..."
                                className="flex-grow mr-4 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {isListening ? (
                                <button
                                    type="button"
                                    onClick={stopVoiceInput}
                                    className="mr-2 text-red-500"
                                >
                                    <Mic color="red" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={startVoiceInput}
                                    className="mr-2 text-blue-500"
                                >
                                    <Mic />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Prompt;
