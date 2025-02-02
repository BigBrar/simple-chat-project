import { useEffect } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = ({ 
    authtoken, 
    currentChat,
    awaitResponseRef,
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
                    
                case 'chat_extracted':
                    console.log('chat extracted');
                    awaitResponseRef.current = false;
                    setIsLoading(false);
                    setChat(data.chat);
                    break;
                    
                case 'ping_response':
                    setIsLoading(false);
                    if (totalMessagesRef.current !== data.message_count) {
                        totalMessagesRef.current = data.message_count;
                        awaitResponseRef.current = true;
                        socket.send(JSON.stringify({
                            'action': 'CHAT_EXTRACTION',
                            'chat_to_extract': currentChat,
                            'authtoken': authtoken
                        }));
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
    }, [authtoken, currentChat]);
};

export default useWebSocket;