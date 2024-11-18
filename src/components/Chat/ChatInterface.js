import styles from './ChatInterface.module.css'
import {useEffect, useRef, useState} from 'react'
import {io} from 'socket.io-client'
export default function ChatInterface(){
    let authtoken = localStorage.getItem('authToken')
    let findUser = useRef()
    const [users, setUsers] = useState([])
    const [chat, setChat] = useState(undefined)
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
        else if (JSON.parse(data).result == 'chat_extracted'){
            console.log('chat extracted')
            const jsonObject = JSON.parse(data);

            // Convert the chat property from a string to an array
            setChat(JSON.parse(jsonObject.chat))
            // setChat(JSON.parse(event.data)['chat'])
            console.log(typeof(JSON.parse(jsonObject.chat)))
        }
        // else {
        //     console.log('data received from server - ',event.data)
        //     console.log(typeof(event.data))
        //     socket.close()
        // }
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
    
    
    const userInput = useRef();
    const [currentChat, setCurrentChat] = useState(users[0]);

    function accessUserChat(buttonText){
        setCurrentChat(buttonText)
        // let socket = new WebSocket('ws://localhost:8865');
        if (ws){
            let socket = ws;
            console.log("socket is ws")
            console.log(socket)
            // socket.send('hello')
            socket.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':buttonText,'authtoken':authtoken}))
        // socket.onmessage = function(event) {
        //     console.log('Message from server:', event.data);
        //     if (event.data == 'connected'){
        //         console.log("connected to server")

        //         socket.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':buttonText,'authtoken':authtoken}))
                
        //         // socket.close()
        //     }
            // else if (JSON.parse(event.data).status == 200){
            //     console.log('chat extracted')
            //     const jsonObject = JSON.parse(event.data);

            //     // Convert the chat property from a string to an array
            //     setChat(JSON.parse(jsonObject.chat))
            //     // setChat(JSON.parse(event.data)['chat'])
            //     console.log(typeof(JSON.parse(jsonObject.chat)))
            // }
            // else {
            //     console.log('data received from server - ',event.data)
            //     console.log(typeof(event.data))
            //     socket.close()
            // }
        // }
    }
}
    function sendData(){
        let data = userInput.current.value
        console.log('input data - ',data)
        ws.send(JSON.stringify({'action':'MSG_SEND','msg_body':data,'authtoken':authtoken, 'receiver':currentChat}))
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
            <div>
                <h1>INPUT FIELD </h1>
                <input ref={userInput} type='text'/>
                <button onClick={sendData}>SEND</button>
            </div>

        </div>
        {chat && chat.map((message)=>(
             message.sent_by === 'sender' ? (
                <div key={message.id}>You: {message.message}</div>
            ) : <div key={message.id}>Receiver: {message.message}</div>
             
        ))}
        </>
    )
}