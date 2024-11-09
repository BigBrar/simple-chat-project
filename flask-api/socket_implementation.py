import asyncio
import json
import websockets

clients = []


async def add_clients(websocket):
    clients.append(websocket)


async def accept_connection(websocket,path):
    try:
        await add_clients(websocket)
        await websocket.send('connected')
    except Exception as e:
        print("The error is ",e)
    message = await websocket.recv()
    message = json.loads(message)
    if message['action'] == 'CHAT_EXTRACTION':
        chat_to_extract = message['chat_to_extract']
        with open('users.json','r')as file:
            data = json.load(file)
        authtoken = message['authtoken']
        for user in data:
            if user['authtoken'] == authtoken:
                username = user['username']
                print('your username is ',username)
        
        with open('chats.json','r')as file:
            data = json.load(file)
        
        for user in data:
            print(f'user = {user} {username}')
            if user['username'] == username:
                for chat_user in user['chats']:
                    if chat_user['username'] == chat_to_extract:
                        whole_chat_msg = json.dumps(chat_user['messages'])
                        await websocket.send(whole_chat_msg)
                        print('chat extracted - ',whole_chat_msg)
    elif message['action'] == 'MSG_SEND':
        with open('users.json','r')as file:
            data = json.load(file)
        authtoken = message['authtoken']
        for user in data:
            if user['authtoken'] == authtoken:
                username = user['username']
                print('your username is ',username)
        
        with open('chats.json','r')as file:
            data = json.load(file)

        for user in data:
            print(f'user = {user} {username}')
            if user['username'] == username:
                for chat_user in user['chats']:
                    if chat_user['username'] == 'lovepreet':
                        current_messages = chat_user['messages']
                        current_messages.append(message['msg_body'])
                        chat_user['messages'] = current_messages
        new_data = data
        print(new_data)
        with open('chats.json','w')as file:
            json.dump(new_data,file)

            
async def start_server():
    async with websockets.serve(accept_connection, "localhost", 8865):
        print("websocket server started ")
        await asyncio.Future()

asyncio.run(start_server())