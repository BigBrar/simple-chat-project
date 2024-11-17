import asyncio
import json
import time
import websockets

clients = []

def get_username_with_authtoken(authtoken):
    with open('users.json','r')as file:
            data = json.load(file)
    for user in data:
        if user['authtoken'] == authtoken:
            username = user['username']
            return username
    print({'status':404, 'result':'invalid authtoken'})
    return {'status':404, 'result':'invalid authtoken'}


async def add_clients(websocket):
    clients.append(websocket)


async def accept_connection(websocket,path):
    try:
        await add_clients(websocket)
        await websocket.send('connected')
    except Exception as e:
        print("The error is ",e)
    while True:
        message = await websocket.recv()
        message = json.loads(message)
        if message['action'] == 'CHAT_EXTRACTION':
            print('chat extraction ran.')
            chat_to_extract = message['chat_to_extract']
            authtoken = message['authtoken']

            username = get_username_with_authtoken(authtoken)
            
            with open('chats.json','r')as file:
                data = json.load(file)
            
            for user in data:
                if user['username'] == username:
                    for chat_user in user['chats']:
                        if chat_user['username'] == chat_to_extract:
                            whole_chat_msg = json.dumps(chat_user['messages'])
                            await websocket.send(json.dumps({'status':'200','result':'chat_extracted','chat':whole_chat_msg}))
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
            print('message send ran')
            authtoken = message['authtoken']
            receiver = message['receiver']
            username = get_username_with_authtoken(authtoken)
            
            with open('chats.json','r')as file:
                data = json.load(file)

            for user in data:
                print(f'user = {user} {username}')
                if user['username'] == username:
                    for chat_user in user['chats']:
                        if chat_user['username'] == receiver:
                            current_messages = chat_user['messages']
                            current_messages.append({'sent_by':'sender', 'message':message['msg_body']})
                            chat_user['messages'] = current_messages
                        else:
                            pass
                            # print('no such chat user ',chat_user)
            for user in data:
                print('receiver:',receiver)
                if user['username'] == receiver:
                    for chat_user in user['chats']:
                        if chat_user['username'] == username:
                            current_messages = chat_user['messages']
                            current_messages.append({'sent_by':'receiver', 'message':message['msg_body']})
                            chat_user['messages'] = current_messages
            new_data = data
            print(new_data)
            with open('chats.json','w')as file:
                json.dump(new_data,file)
        
        elif message['action'] == 'GET_USER_CHATS':
            authtoken = message['authtoken']
            username = get_username_with_authtoken(authtoken)
            with open('chats.json','r')as file:
                data = json.load(file)

            chat_users = []

            for user in data:
                if user['username'] == username:
                    for chat_user in user['chats']:
                        chat_users.append(chat_user['username'])
            print('chat users = ',chat_users)
            await websocket.send(json.dumps({'status':200,'result':'retrieve_user_chats','chat_users':chat_users}))
            

            
async def start_server():
    async with websockets.serve(accept_connection, "localhost", 8865):
        print("websocket server started ")
        await asyncio.Future()

asyncio.run(start_server())