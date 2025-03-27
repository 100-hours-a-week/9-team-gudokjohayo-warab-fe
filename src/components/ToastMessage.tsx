import React from "react";

interface ToastMessageProps {
    message: string;
    isVisible?: boolean;
}

const ToastMessage: React.FC<ToastMessageProps> = ({
    message,
    isVisible = true,
}) => {
    if (!isVisible) return null;

    return (
        <div
            className="absolute left-0 right-0 w-full flex justify-center"
            style={{ bottom: "10%" }}
        >
            <div className="bg-orange-500 text-white text-center py-4 px-4 rounded-full shadow-lg mx-4">
                {message}
            </div>
        </div>
    );
};

export default ToastMessage;
