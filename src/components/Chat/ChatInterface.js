import styles from './ChatInterface.module.css';
import {useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import ChatHeader from '../chat_components/ChatHeader.js'
import AllChats from '../chat_components/AllChats.js';
import CurrentChat from '../chat_components/CurrentChat.js';

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
        <ChatHeader styles={styles} findUser={findUser} addNewChat={addNewChat} />
        
        <div className={styles.mainContainer}>

            <AllChats styles={styles} users={users} accessUserChat={accessUserChat}/>

            <CurrentChat currentChat={currentChat} userInput={userInput} sendData={sendData} clearChat={clearChat} styles={styles} chat={chat} />
                
        </div>
        
        </>
    )
}