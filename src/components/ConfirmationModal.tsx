import React from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmButtonText: string;
    cancelButtonText: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmButtonText,
    cancelButtonText,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50"></div>

            {/* Modal Container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-xl z-10 mx-4 max-w-sm w-full">
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-4">{title}</h3>
                    <p className="mb-8">{message}</p>

                    <div className="flex space-x-4 justify-center">
                        <button
                            className="px-6 py-2 rounded-full bg-white border border-gray-300 text-sm"
                            onClick={onCancel}
                        >
                            {cancelButtonText}
                        </button>
                        <button
                            className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm"
                            onClick={onConfirm}
                        >
                            {confirmButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
