import styles from './ChatInterface.module.css'
import {useRef, useState} from 'react'
export default function ChatInterface(){
    const userInput = useRef();
    let authtoken = localStorage.getItem('authToken')
    let users = [
        {username:'sardarioo'},
        {username:'lovepreet'},
        {username:'rakulpreet singh'}
    ]
    const [currentChat, setCurrentChat] = useState(users[0]['username']);

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
                {users.map((user)=>(
                    <div className={styles.user}>
                    <button onClick={()=>accessUserChat(user.username)} className={styles.userButton}>{user.username}</button>
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