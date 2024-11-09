export default function Socket(){
    let socket;
    function connect_to_server(){
        socket = new WebSocket('ws://localhost:8865');
        socket.onmessage = function(event) {
            // console.log('Message from server:', event.data);
            if (event.data == 'connected'){
                console.log("connected to server")
                alert("connected to server.")
            }
        }
    }
    return (
        <>
        <button onClick={connect_to_server}>connect to server ?</button>
        </>
    )
}