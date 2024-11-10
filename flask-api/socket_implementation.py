import asyncio
import json
import time
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
            if user['username'] == username:
                for chat_user in user['chats']:
                    if chat_user['username'] == chat_to_extract:
                        whole_chat_msg = json.dumps(chat_user['messages'])
                        await websocket.send(whole_chat_msg)
                        print('chat extracted - ',whole_chat_msg)
                        return 0
                user['chats'].append({'username':chat_to_extract, 'messages':[]})
                updated_data = data
                with open('chats.json','w')as file:
                    json.dump(updated_data, file)
                await websocket.send([])
                return 0
        updated_data = {"username": username, "chats": [{'username':chat_to_extract, 'messages':[]}]}
        data.append(updated_data)
        with open('chats.json','w')as file:
                json.dump(data, file)
                await websocket.send([])
                        
    elif message['action'] == 'MSG_SEND':
        with open('users.json','r')as file:
            data = json.load(file)
        authtoken = message['authtoken']
        receiver = message['receiver']
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
                    if chat_user['username'] == receiver:
                        current_messages = chat_user['messages']
                        current_messages.append({'sender':username, 'message':message['msg_body']})
                        chat_user['messages'] = current_messages
                    else:
                        pass
                        # print('no such chat user ',chat_user)
        for user in data:
            if user['username'] == receiver:
                for chat_user in user['chats']:
                    if chat_user['username'] == username:
                        current_messages = chat_user['messages']
                        current_messages.append({'receiver':username, 'message':message['msg_body']})
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