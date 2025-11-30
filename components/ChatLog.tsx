import React, { useEffect, useRef } from 'react';
import { Transcript } from '../types';

interface ChatLogProps {
  transcripts: Transcript[];
  readyMessage: string;
}

const ChatLog: React.FC<ChatLogProps> = ({ transcripts, readyMessage }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide mask-gradient space-y-3 px-4 z-10">
      {transcripts.length === 0 && (
        <div className="text-center text-gray-500 text-sm mt-10">
          {readyMessage}
        </div>
      )}
      {transcripts.map((t, i) => (
        <div 
            key={i} 
            className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm backdrop-blur-sm border ${
                t.role === 'user' 
                ? 'bg-blue-600/30 border-blue-400/30 text-blue-100' 
                : 'bg-emerald-600/30 border-emerald-400/30 text-emerald-100'
            }`}
          >
            {t.text}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default ChatLog;