import styles from './ChatInterface.module.css';
import {useEffect, useRef, useState} from 'react';
import useWebSocket from '../chat_components/useWebSocket.js';
import usePingServer from '../chat_components/usePingServer.js';
import ChatHeader from '../chat_components/ChatHeader.js';
import AllChats from '../chat_components/AllChats.js';
import CurrentChat from '../chat_components/CurrentChat.js';

export default function ChatInterface(){
    let authtoken = localStorage.getItem('authToken')
    let findUser = useRef()
    const awaitResponse = useRef();
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [chat, setChat] = useState(undefined)
    const [currentChat, setCurrentChat] = useState(users[0]);
    const [ws, setws] = useState(null);
    
    const userInput = useRef();
    const totalMessages = useRef();
    //handles all the ws replies from server.
    useWebSocket({
        authtoken,
        currentChat,
        awaitResponseRef: awaitResponse,
        totalMessagesRef: totalMessages,
        isLoading:isLoading,
        setIsLoading,setIsLoading,
        setChat,
        setUsers,
        setws
    });
    
    //pinging the server for chat updates
    usePingServer({
        ws, 
        awaitResponse, 
        currentChat, 
        authtoken,
        setIsLoading
    })
    
    //fetches userChat whenever user clicks on a certain chat
    function accessUserChat(buttonText){
        if (ws && buttonText != currentChat){
            setIsLoading(true)
            let socket = ws;
            console.log("socket is ws")
            // console.log(socket)
            // socket.send('hello')
            socket.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':buttonText,'authtoken':authtoken}))
            console.log('socket send ...')
            setCurrentChat(buttonText)
            setChat('')
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
    const response = fetch('https://localhost:5000/chat/addcontact', requestOptions);
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

            <CurrentChat currentChat={currentChat} userInput={userInput} sendData={sendData} clearChat={clearChat} styles={styles} chat={chat} isLoading={isLoading} />
                
        </div>
        
        </>
    )
}