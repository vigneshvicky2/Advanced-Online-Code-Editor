import { Brain} from 'lucide-react';
import React, { useState } from 'react';
import GemChat from './Gemchat';

const AiChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Trigger Button */}
      <button
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl px-4 py-2 text-white shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out z-50"
        onClick={() => setIsOpen(true)}
      >
        <Brain size={20} /> <span>Chat with AI</span>
      </button>

      {/* Popup Chat Window */}
      {isOpen && <GemChat onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default AiChat;
