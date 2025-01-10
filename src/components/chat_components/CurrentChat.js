  import React, { useRef, useEffect} from 'react';
  import eraserImage from '../images/eraser.png';
  import './currentchat.css';

  export default function CurrentChat({ currentChat, userInput, sendData, clearChat, chat }) {
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
            <div className="chat-messages"  ref={chatContainerRef} style={{ overflowY: 'auto' }}>
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
            </div>
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