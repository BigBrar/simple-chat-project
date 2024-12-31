export default function CurrentChat({currentChat, userInput, sendData, clearChat, styles, chat }){
    return (
        <div >
                { currentChat &&
                <>
                <h1>INPUT FIELD </h1>
                <input ref={userInput} type='text'/>
                <button onClick={sendData}>SEND</button><br/>
                <button onClick={clearChat}>CLEAR CHAT ALL</button>
                </>
                }
                {!currentChat && 
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '1.6rem' }}>
                    <h2>Select a chat to view messages</h2>
                </div>
                }
                <div className={styles.selectedChat} style={{height:'300px', overflowY:'auto'}}>
                {chat && chat.map((message)=>(
                    <div
                    key={message.id}
                    style={{
                        textAlign: message.sent_by === currentChat ? 'left' : 'right',
                        margin: '5px 0',
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: message.sent_by === currentChat ? '#f1f1f1' : '#d1e7ff',
                        display: 'inline-block',
                        maxWidth: '70%'
                    }}
                >                                           
                    {`${message.message}`}
                </div>
            //  message.sent_by === currentChat ? (
            //     <div key={message.id}>Receiver: {message.message}</div>
            // ) : <div key={message.id}>Sender: {message.message}</div>
             
        ))}
                </div>
    </div>
    )
}