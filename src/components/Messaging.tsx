import React, { useState } from 'react';
import { Search, Send, User, Check, CheckCheck, MessageSquare } from 'lucide-react';

const MOCK_CHATS = [
  { id: '1', name: 'Dr. Sarah Smith', lastMessage: 'The lab results for Mr. Johnson are in.', time: '10:30 AM', unread: 2, online: true },
  { id: '2', name: 'Nurse Thompson', lastMessage: 'Patient in Room 4 is ready for the visit.', time: '9:45 AM', unread: 0, online: true },
  { id: '3', name: 'Billing Dept', lastMessage: 'CMS 1500 form updated for last week.', time: 'Yesterday', unread: 0, online: false },
  { id: '4', name: 'Dr. James Wilson', lastMessage: 'Can you review the ECG for Sarah Jenkins?', time: 'Yesterday', unread: 0, online: false },
];

const Messaging: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState('');

  return (
    <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden relative">
      {/* Chat List */}
      <div className={`w-full md:w-80 border-r border-zinc-100 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_CHATS.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors border-b border-zinc-50 ${
                selectedChat?.id === chat.id ? 'bg-emerald-50/50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                  {chat.name.split(' ').map(n => n[0]).join('')}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-baseline mb-1">
                  <p className="font-bold text-zinc-900 text-sm truncate">{chat.name}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">{chat.time}</p>
                </div>
                <p className="text-xs text-zinc-500 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-zinc-50/30 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-600"
                >
                  <Search className="w-5 h-5 rotate-90" /> {/* Using Search as a placeholder for back arrow or similar if not imported */}
                </button>
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                  {selectedChat.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{selectedChat.name}</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                    {selectedChat.online ? 'Online' : 'Away'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Today
                </span>
              </div>

              <div className="flex items-start gap-3 max-w-[90%] md:max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                  {selectedChat.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="bg-white p-3 md:p-4 rounded-2xl rounded-tl-none border border-zinc-100 shadow-sm">
                  <p className="text-sm text-zinc-800 leading-relaxed">
                    Hello Dr. Richardson, I've reviewed the latest RPM data for Mr. Johnson. His blood pressure has been consistently high over the last 48 hours.
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-2 font-medium">10:25 AM</p>
                </div>
              </div>

              <div className="flex items-start gap-3 max-w-[90%] md:max-w-[80%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                  DR
                </div>
                <div className="bg-emerald-500 p-3 md:p-4 rounded-2xl rounded-tr-none shadow-md shadow-emerald-500/10">
                  <p className="text-sm text-white leading-relaxed">
                    Thanks for the heads up. I'll schedule a quick telehealth follow-up for this afternoon to adjust his medication.
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <p className="text-[10px] text-emerald-100 font-medium">10:28 AM</p>
                    <CheckCheck className="w-3 h-3 text-emerald-100" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 max-w-[90%] md:max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                  {selectedChat.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="bg-white p-3 md:p-4 rounded-2xl rounded-tl-none border border-zinc-100 shadow-sm">
                  <p className="text-sm text-zinc-800 leading-relaxed">
                    Sounds good. I'll notify the patient and set up the link.
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-2 font-medium">10:30 AM</p>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
