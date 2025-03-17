import React, { useState } from "react";

interface PartyFindTabProps {
    // Add any props if needed
}

interface Message {
    id: string;
    user: string;
    content: string;
}

const PartyFindTab: React.FC<PartyFindTabProps> = () => {
    // Messages state
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", user: "ivan", content: "소통해요 ^^" },
        { id: "2", user: "mona", content: "실력 챌린전데 팀온 때문에 브론즈" },
        {
            id: "3",
            user: "dylan",
            content:
                "하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하",
        },
        { id: "4", user: "eddie", content: "팀원 구해요~^^" },
    ]);

    // Current user message
    const [currentMessage, setCurrentMessage] = useState<string>("");

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(e.target.value);
    };

    // Handle send message
    const handleSendMessage = () => {
        if (currentMessage.trim() === "") return;

        const newMessage: Message = {
            id: `${messages.length + 1}`,
            user: "me", // You can change this to the current user name
            content: currentMessage,
        };

        setMessages([...messages, newMessage]);
        setCurrentMessage("");
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    // Function to truncate username if needed while maintaining display structure
    const formatUsername = (username: string) => {
        if (username.length > 12) {
            return username.substring(0, 12) + "...";
        }
        return username;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto mb-3">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className="p-2 mb-2 bg-white rounded-lg shadow-sm"
                    >
                        <div className="flex items-center">
                            <div className="w-8 h-8 mr-2 flex ">
                                <img
                                    src="/images/discord.png"
                                    alt="Discord"
                                    className="w-5 h-5"
                                />
                            </div>
                            <div className="flex flex-1">
                                <div className="w-20 min-w-20 mr-2">
                                    <span className="font-medium text-gray-800 truncate block text-xs">
                                        {formatUsername(message.user)}
                                    </span>
                                </div>
                                <span className="text-gray-400 mr-2 text-xs">
                                    |
                                </span>
                                <span className="text-gray-600 flex-1 break-words text-xs">
                                    {message.content}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message input */}
            <div className="mt-auto relative">
                <div className="flex items-center bg-white rounded-full border border-gray-300">
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요."
                        className="flex-1 py-2 px-4 bg-transparent outline-none rounded-full text-sm"
                        value={currentMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className={`absolute right-2 p-1.5 rounded-full ${
                            currentMessage.trim() === ""
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-orange-500 text-white"
                        }`}
                        onClick={handleSendMessage}
                        disabled={currentMessage.trim() === ""}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartyFindTab;
