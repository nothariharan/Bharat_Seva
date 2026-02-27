import React from 'react';
import ChatAssistant from './ChatAssistant';

const ChatSidebar = ({ isOpen, onClose, currentStep, actionPlan, language }) => (
    <div className={`fixed right-0 top-0 h-full w-80 sm:w-96 bg-gray-50 shadow-2xl z-[100] transform transition-transform duration-300 chat-sidebar ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex justify-between items-center p-4 bg-blue-600 text-white shadow-md">
            <h3 className="font-bold text-lg">Ask AI Support</h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto w-full">
            <ChatAssistant
                currentStep={currentStep}
                actionPlanTitle={actionPlan?.title || "Bharat Seva Action Plan"}
                language={language}
            />
        </div>
    </div>
);

export default ChatSidebar;
