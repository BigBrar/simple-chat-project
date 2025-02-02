import React, { useRef, useEffect} from 'react';
import eraserImage from '../images/eraser.png';
import './currentchat.css';
import loadChat from '..//images/videos/loadingChat.mp4'

export default function CurrentChat({ currentChat, userInput, sendData, clearChat, chat, isLoading }) {
  const chatContainerRef = useRef(null);
  const autoScrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    autoScrollToBottom();
  }, [chat]);

  return (

    <div className="current-chat">
      {!currentChat && (
        <div className="no-chat-selected">
          <h2>Select a chat to view messages</h2>
        </div>
      )}

      {currentChat && (
        <div className="chat-container">

          {chat && <div className="chat-messages"  ref={chatContainerRef} style={{ overflowY: 'auto' }}>
            {chat &&
              chat.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${
                    message.sent_by === currentChat ? 'received' : 'sent'
                  }`}
                >
                  <p style={{padding:'6px',backgroundColor:message.sent_by === currentChat ? '#d1e7ff' : '#f1f1f1', borderRadius:'5px'}}>{message.message}</p>
                </div>
              ))}
          </div>}

          {!chat && isLoading && <div style={{display:'flex',alignItems:'center',justifyContent:'center', height:'100%'}}>
            <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-45 h-32 object-cover"
          >
            <source src={loadChat} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
            </div>}


          {!chat && !isLoading && <div style={{display:'flex',alignItems:'center',justifyContent:'center', height:'100%'}}>
            <h1>No messages here, send a message to make it appear...</h1>
            </div>}


          <div className="chat-input">
            <button onClick={clearChat}><img className='eraserImage' src={eraserImage}></img></button>
            <form onSubmit={sendData}>
            <input
              className="send-input"
              ref={userInput}
              placeholder="Message"
              type="text"
            />
            </form>
            
            <button onClick={sendData}>SEND</button>
          </div>
        </div>
      )}
    </div>
  );
}








/* 
jsx code that is created by ai and is much more beautiful but has scrollbar issues - 
<div className="flex flex-col h-full bg-gray-50">
{!currentChat ? (
  <div className="flex items-center justify-center h-full">
    <div className="text-center p-8 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl text-gray-600 font-medium">
        Select a chat to view messages
      </h2>
    </div>
  </div>
) : (
  <div className="flex flex-col h-full bg-white relative">
    // {/* Chat Messages Container */
//       {chat ? (
//         <div 
//           ref={chatContainerRef}
//           className="h-[calc(100%-80px)] overflow-y-auto px-4 py-6 space-y-4" /* Fixed height calculation */
//         >
//           {chat.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${
//                 message.sent_by === currentChat 
//                   ? 'justify-start' 
//                   : 'justify-end'
//               } mb-4`}
//             >
//               <div
//                 className={`max-w-[70%] px-4 py-2 rounded-2xl break-words ${
//                   message.sent_by === currentChat
//                     ? 'bg-blue-50 text-gray-800'
//                     : 'bg-blue-500 text-white'
//                 }`}
//               >
//                 <p className="text-sm">{message.message}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="flex items-center justify-center h-[calc(100%-80px)]">
//           <div className="animate-pulse flex space-x-4">
//             <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
//             <div className="space-y-3">
//               <div className="h-4 w-24 bg-gray-200 rounded"></div>
//               <div className="h-4 w-32 bg-gray-200 rounded"></div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Input Area - Fixed to bottom */}
//       <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4 h-[80px]">
//         <div className="flex items-center gap-4 h-full">
//           <button
//             onClick={clearChat}
//             className="p-2 text-gray-400 hover:text-red-500 transition-colors"
//             title="Clear chat"
//           >
//             <svg 
//               className="w-5 h-5"
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24"
//             >
//               <path 
//                 strokeLinecap="round" 
//                 strokeLinejoin="round" 
//                 strokeWidth={2} 
//                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
//               />
//             </svg>
//           </button>

//           <form onSubmit={sendData} className="flex-1 flex gap-2">
//             <input
//               ref={userInput}
//               type="text"
//               placeholder="Type a message..."
//               className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
//             />
//             <button
//               onClick={sendData}
//               type="submit"
//               className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
//             >
//               Send
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )}
// </div>
// */