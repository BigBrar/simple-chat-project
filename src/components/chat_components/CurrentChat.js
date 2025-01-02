import beauty from './components.module.css'

export default function CurrentChat({currentChat, userInput, sendData, clearChat, styles, chat }){
    return (
        <div className={beauty.currentChat} style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                
                {!currentChat && 
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '1.6rem' }}>
                    <h2>Select a chat to view messages</h2>
                </div>
                }
                <div className={styles.selectedChat} style={{height:'85vh', overflowY:'auto', width:'100%'}}>
                {chat && chat.map((message)=>(
                    <div
                    key={message.id}
                    style={{
                        margin: '5px 0',
                        display: 'flex',
                        justifyContent: message.sent_by === currentChat ? 'flex-end' : 'flex-start',
                        alignItems: 'center',
                        padding: '10px',
                        borderRadius: '8px',
                        // backgroundColor: message.sent_by === currentChat ? '#d1e7ff' : '#f1f1f1',
                        maxWidth: '60%',
                        wordWrap: 'break-word'
                    }}
                >                             
                              
                <p style={{backgroundColor:message.sent_by === currentChat ? '#d1e7ff' : '#f1f1f1',padding:'6px',borderRadius:'5px'}}>    {`${message.message}`}</p>
                    
                </div>
            //  message.sent_by === currentChat ? (
            //     <div key={message.id}>Receiver: {message.message}</div>
            // ) : <div key={message.id}>Sender: {message.message}</div>
             
        ))}
                </div>
                { currentChat &&
                <div className={beauty.sendContainer}>
                <button onClick={clearChat}>CLEAR CHAT ALL</button>
                <input className={beauty.sendInput} ref={userInput} placeholder="Message" type='text'/>
                <button onClick={sendData}>SEND</button>
                </div>
                }
    </div>
    )
}