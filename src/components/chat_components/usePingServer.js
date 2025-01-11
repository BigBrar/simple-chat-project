import { useEffect } from "react";

const usePingServer = ({ws, awaitResponse, currentChat, authtoken})=>{
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
}

export default usePingServer;