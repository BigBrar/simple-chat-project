import styles from './ChatInterface.module.css';
import {useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import ChatHeader from '../chat_components/ChatHeader.js';
import AllChats from '../chat_components/AllChats.js';
import CurrentChat from '../chat_components/CurrentChat.js';

export default function ChatInterface(){
    let authtoken = localStorage.getItem('authToken')
    let findUser = useRef()
    const awaitResponse = useRef();
    const [users, setUsers] = useState([])
    const [chat, setChat] = useState(undefined)
    const [currentChat, setCurrentChat] = useState(users[0]);
    const [ws, setws] = useState(null);
    useEffect(()=>{
    //starting the initial connection that will be maintained throughout the session.
    let socket = new io('http://localhost:5000');
    
    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        socket.send(JSON.stringify({'action':'GET_USER_CHATS','authtoken':authtoken}))
    });
    
    //this maintains all the websocket responses from the server.
    socket.on('message', (data)=> {
        console.log('message received from the server - ',data)
        console.log("type of data = ",typeof(data))
        if(data.result == 'connected'){
            console.log('connected to the server')
        }
        else if (data.result == 'chat_extracted'){
            console.log('chat extracted')
            awaitResponse.current = false;
            const jsonObject = data;

            setChat(jsonObject.chat)
            console.log("Chat messages",jsonObject.chat)
            console.log(typeof(jsonObject.chat))
        }
        
        else if(data.result == 'ping_response'){
            console.log("Ping response ....")
            console.log(data)
            console.log('totalmessages ',totalMessages.current)
            console.log('messages count', data.message_count)
            if (totalMessages.current != data.message_count){
                console.log('if ran ')
                totalMessages.current = data.message_count
                console.log('updated total messages', totalMessages.current)
                awaitResponse.current = true;
                console.log("sending chat EXTRACTION")
                socket.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
            }
        }
        else if(data.result == 'retrieve_user_chats'){
            console.log('message from the server - ',data)
            setUsers(data.chat_users)
            console.log('value of users is ',users)
            
        }
        else{
            console.log('message from the server - ',data)
            console.log(typeof(data))
        }
    })
    //setting so that websocket can be accessed globally outside useEffect
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
          if (ws && ws.connected && currentChat && !awaitResponse.current) {
            ws.send(JSON.stringify({action:'PING',user1:authtoken, user2: currentChat}))
            console.log('Sent PING to server')
          }
          else if (awaitResponse.current){
            ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
          }
        }, 1000) // Ping every 1 seconds
    
        // Cleanup interval on component unmount or when WebSocket changes
        return () => clearInterval(interval)
      }, [ws, currentChat, authtoken])
    
    
    const userInput = useRef();
    const totalMessages = useRef();
    //fetches userChat whenever user clicks on a certain chat
    function accessUserChat(buttonText){
        if (ws && buttonText != currentChat){
            let socket = ws;
            console.log("socket is ws")
            // console.log(socket)
            // socket.send('hello')
            socket.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':buttonText,'authtoken':authtoken}))
            console.log('socket send ...')
            setCurrentChat(buttonText)
            totalMessages.current = 0;
        
    }
    else if (buttonText == currentChat){
        //chat is already open so nothing happens
        return 
    }
}
    //sends the message to the receiver and extracts whole chat after sending
    function sendData(e){
        e.preventDefault();
        let data = userInput.current.value
        userInput.current.value = '';
        ws.send(JSON.stringify({'action':'MSG_SEND','msg_body':data,'authtoken':authtoken, 'receiver':currentChat}))
        ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
    }
    //clears the whole chat on the server.
    function clearChat(){
        ws.send(JSON.stringify({'action':'CLEAR_CHAT','authtoken':authtoken, 'receiver':currentChat}))
        ws.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':currentChat,'authtoken':authtoken}))
    }
    //adds a new chat to the user's chat list
    function addNewChat(){
        let receiver = findUser.current.value
        const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'authtoken' : authtoken, 'username':receiver })
    };
    const response = fetch('http://localhost:5000/chat/addcontact', requestOptions);
    console.log("Fetched all user chats...")
    if (response.status == 200){
        ws.send(JSON.stringify({'action':'GET_USER_CHATS','authtoken':authtoken}))
        return 'something'
    }
    else if (response.status == 400 || response.status == 404){
        alert(response.result)
        return 'nothing'
    }
}
    return(
        <>
        <ChatHeader styles={styles} findUser={findUser} addNewChat={addNewChat} />
        
        <div className={styles.mainContainer}>

            <AllChats styles={styles} users={users} accessUserChat={accessUserChat} currentChat={currentChat}/>

            <CurrentChat currentChat={currentChat} userInput={userInput} sendData={sendData} clearChat={clearChat} styles={styles} chat={chat} />
                
        </div>
        
        </>
    )
}