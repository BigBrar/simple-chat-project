import { useEffect } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = ({ 
    authtoken, 
    currentChat,
    awaitResponse,
    totalMessagesRef,
    setChat,
    setUsers,
    isLoading,
    setIsLoading,
    setws
}) => {
    useEffect(() => {
        // const socket = new io('https://web-6avxcz6o5pwj.up-de-fra1-k8s-1.apps.run-on-seenode.com/', {
        //     transports: ['websocket', 'polling'], // Use WebSocket first, then fallback to polling
        // });
        
        const socket = new io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            socket.send(JSON.stringify({
                'action': 'GET_USER_CHATS',
                'authtoken': authtoken
            }));
        });
        
        socket.on('message', (data) => {
            console.log('message received from the server - ', data);
            
            switch(data.result) {
                case 'connected':
                    console.log('connected to the server');
                    break;

                case 'chat_empty':
                    console.log('chat empty');
                    // setAwaitResponse(false);
                    awaitResponse.current = false;
                    setIsLoading(false);
                    setChat([]);
                    break;
                    
                case 'chat_extracted':
                    console.log('chat extracted');
                    awaitResponse.current = false;
                    // setAwaitResponse(false);
                    console.log("Value of awaitResponse is ", awaitResponse.current)
                    setIsLoading(false);
                    setChat(data.chat);
                    console.log('chat extracted - ', data.chat);
                    break;
                    
                case 'ping_response':
                    console.log('ping response ran ...');
                    setIsLoading(false);
                    if (totalMessagesRef.current !== data.message_count) {
                        console.log('entered if statement');
                        totalMessagesRef.current = data.message_count;
                        // setAwaitResponse(true);
                        awaitResponse.current = true;
                        console.log("Currnet chat is ", currentChat)
                        socket.send(JSON.stringify({
                            'action': 'CHAT_EXTRACTION',
                            'chat_to_extract': currentChat,
                            'authtoken': authtoken
                        }));
                        console.log("sent chat extraction request")
                        
                    }
                    break;
                    
                case 'retrieve_user_chats':
                    setUsers(data.chat_users);
                    break;
                    
                default:
                    console.log('message from the server - ', data);
            }
        });

        setws(socket);

        return () => {
            socket.close();
        };
    }, [authtoken]);
};

export default useWebSocket;