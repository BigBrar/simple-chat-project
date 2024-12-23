import styles from './ChatInterface.module.css'
import {useEffect, useRef, useState} from 'react'
import {io} from 'socket.io-client'
export default function ChatInterface(){
    let authtoken = localStorage.getItem('authToken')
    let findUser = useRef()
    const [users, setUsers] = useState([])
    const [chat, setChat] = useState(undefined)
    const [currentChat, setCurrentChat] = useState(users[0]);
    const [ws, setws] = useState(null);
    useEffect(()=>{
    let socket = new io('http://localhost:5000');

    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        socket.send(JSON.stringify({'action':'GET_USER_CHATS','authtoken':authtoken}))
    });
    
    socket.on('message', (data)=> {
        
        if(data == 'connected'){
            console.log('connected to the server')
        }
        else if (data.result == 'chat_extracted'){
            console.log('chat extracted')
            const jsonObject = data;

            // Convert the chat property from a string to an array
            setChat(jsonObject.chat)
            console.log("Chat messages",jsonObject.chat)
            // setChat(JSON.parse(event.data)['chat'])
            console.log(typeof(jsonObject.chat))
        }
        // else {
        //     console.log('data received from server - ',event.data)
        //     console.log(typeof(event.data))
        //     socket.close()
        // }
        else if(data.result == 'ping_response'){
            console.log("Ping response ....")
            console.log(data)
            console.log('totalmessages ',totalMessages.current)
            console.log('messages count', data.message_count)
            if (totalMessages.current != data.message_count){
                console.log('if ran ')
                totalMessages.current = data.message_count
                console.log('updated total messages', totalMessages.current)
                console.log("sending chat EXTRACTION")
                socket.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
            }
        }
        else{
            console.log('message from the server - ',data)
            console.log(JSON.parse(data))
            let variable_test = JSON.parse(data)
            setUsers(variable_test['chat_users'])
            console.log('value of users is ',users)
            
        }
    })
    // socket.onopen = function(){
    //     socket.send(JSON.stringify({'action':'GET_USER_CHATS','authtoken':authtoken}))
    // }

    setws(socket);

    return () => {
        socket.close();
    };
    },[])

    //pinging the server for chat updates
    useEffect(() => {
        console.log('secodn useEffect ran...')
        if (!ws) return
        console.log('sending ping')
        const interval = setInterval(() => {
          if (ws && ws.connected && currentChat) {
            ws.send(JSON.stringify({action:'PING',user1:authtoken, user2: currentChat}))
            console.log('Sent PING to server')
          }
        }, 1000) // Ping every 5 seconds
    
        // Cleanup interval on component unmount or when WebSocket changes
        return () => clearInterval(interval)
      }, [ws, currentChat, authtoken])
    
    
    const userInput = useRef();
    const totalMessages = useRef();
    function accessUserChat(buttonText){
        // setCurrentChat(buttonText)
        // let socket = new WebSocket('ws://localhost:8865');
        if (ws){
            let socket = ws;
            console.log("socket is ws")
            // console.log(socket)
            // socket.send('hello')
            socket.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':buttonText,'authtoken':authtoken}))
            console.log('socket send ...')
            setCurrentChat(buttonText)
        
    }
}
    function sendData(){
        let data = userInput.current.value
        userInput.current.value = '';
        ws.send(JSON.stringify({'action':'MSG_SEND','msg_body':data,'authtoken':authtoken, 'receiver':currentChat}))
        ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
        ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
        ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
    }

    function clearChat(){
        ws.send(JSON.stringify({'action':'CLEAR_CHAT','authtoken':authtoken, 'receiver':currentChat}))
        ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
        ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
        ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
    }

    function addNewChat(){
        let receiver = findUser.current.value
        const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'authtoken' : authtoken, 'username':receiver })
    };
    const response = fetch('http://localhost:5000/addcontact', requestOptions);
    console.log(response.json)
}
    return(
        <>
        <div className={styles.search}>
            <h2>Find User</h2>
            <input ref={findUser} className={styles.findUser} placeholder='username'></input>
            <button onClick={addNewChat}>Add</button>
        </div>
        <div className={styles.mainContainer}>
            <div className={styles.chats}>
                <h2 className={styles.heading}>Heading</h2>
                { users.map((user)=>(
                    <div className={styles.user}>
                    <button onClick={()=>accessUserChat(user)} className={styles.userButton}>{user}</button>
                    </div>
                ))}
            </div>
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
                
        </div>
        
        </>
    )
}