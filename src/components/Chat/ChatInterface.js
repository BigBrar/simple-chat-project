import styles from './ChatInterface.module.css'
import {useEffect, useRef, useState} from 'react'
export default function ChatInterface(){
    let authtoken = localStorage.getItem('authToken')
    const [users, setUsers] = useState([])
    useEffect(()=>{
    let socket = new WebSocket('ws://localhost:8865');
    
    socket.onmessage = function(event){
        if(event.data == 'connected'){
            console.log('connected to the server')
        }
        else{
            console.log('message from the server - ',event.data)
            console.log(JSON.parse(event.data))
            let variable_test = JSON.parse(event.data)
            setUsers(variable_test['chat_users'])
            console.log('value of users is ',users)
            
        }
    }
    socket.onopen = function(){
        socket.send(JSON.stringify({'action':'GET_USER_CHATS','authtoken':authtoken}))
    }
    },[])
    
    
    const userInput = useRef();
    const [currentChat, setCurrentChat] = useState(users[0]);

    function accessUserChat(buttonText){
        setCurrentChat(buttonText)
        let socket = new WebSocket('ws://localhost:8865');
        socket.onmessage = function(event) {
            console.log('Message from server:', event.data);
            if (event.data == 'connected'){
                console.log("connected to server")

                socket.send(JSON.stringify({'action':'CHAT_EXTRACTION','chat_to_extract':buttonText,'authtoken':authtoken}))
                
                // socket.close()
            }
            else {
                console.log('data received from server - ',event.data)
                socket.close()
            }
        }
    }

    function sendData(){
        let data = userInput.current.value
        let socket = new WebSocket('ws://localhost:8865');
        socket.onopen = function(){
        socket.send(JSON.stringify({'action':'MSG_SEND','msg_body':data,'authtoken':authtoken, 'receiver':currentChat}))
        socket.close()}
    }
    return(
        <>
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
        </>
    )
}