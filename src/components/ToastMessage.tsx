import React from "react";

interface ToastMessageProps {
    message: string;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ message }) => {
    return (
        <div className="w-full">
            <div className="bg-orange-500 text-white text-center py-4 px-6 rounded-full">
                {message}
            </div>
        </div>
    );
};

export default ToastMessage;
