from config import db
from flask_socketio import emit
from models import User, Chat, Message
from utils.utils import get_chat_users, extract_chat, get_username_with_authtoken, get_chat_length
import json


def setup_socketio_events(socketio):
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('message', {'status': '200', 'result': 'connected'})

    @socketio.on('message')
    def handle_message(data):
        data = json.loads(data)
        if data['action'] == 'GET_USER_CHATS':
            print('chat extraction required')
            authtoken = data['authtoken']
            if not authtoken:
                emit('error', {'status': 400, 'result': 'Auth token is required'})
                return

            # Retrieve username using auth token
            username = get_username_with_authtoken(authtoken)
            if isinstance(username, dict) and username.get('status') == 404:
                emit('error', username)
                return

            # Get the list of chat users
            chat_users_response = get_chat_users(username)
            print(f'chat_users_response = {chat_users_response}')
            emit('message', chat_users_response)
        elif data['action'] == 'CHAT_EXTRACTION':
            print('Chat extraction ran.')

            # Extract parameters from WebSocket message
            chat_to_extract = data.get('chat_to_extract')
            authtoken = data.get('authtoken')

            if not chat_to_extract or not authtoken:
                emit('error', {'status': 400, 'result': 'Missing required fields'})
                return

            # Get the logged-in user's username from the auth token
            username = get_username_with_authtoken(authtoken)
            if isinstance(username, dict) and username.get('status') == 404:
                emit('error', username)
                return

            # Get the logged-in user from the database
            user = db.session.query(User).filter_by(username=username).first()
            if not user:
                emit('error', {'status': 404, 'result': 'Logged-in user not found'})
                return

            # Extract chat messages
            response = extract_chat(user.id, chat_to_extract)
            print('send back the chat messages...')
            emit('message', response)
        
        elif data['action'] == 'MSG_SEND':
            print('Message sending initiated.')

            # Extract details from the received object
            msg_body = data.get('msg_body')
            authtoken = data.get('authtoken')
            receiver_username = data.get('receiver')

            # Check for missing fields
            if not msg_body or not authtoken or not receiver_username:
                emit('error', {'status': 400, 'result': 'Invalid message format'})
                return

            try:
                # Verify the sender's auth token and get their username
                sender_username = get_username_with_authtoken(authtoken)
                if isinstance(sender_username, dict) and sender_username.get('status') == 404:
                    emit('error', sender_username)
                    return

                # Retrieve the sender and receiver user objects
                sender = db.session.query(User).filter_by(username=sender_username).first()
                receiver = db.session.query(User).filter_by(username=receiver_username).first()

                if not sender or not receiver:
                    emit('error', {'status': 404, 'result': 'Sender or receiver not found'})
                    return

                # Retrieve or create a chat between sender and receiver
                chat = db.session.query(Chat).filter(
                    ((Chat.user1_id == sender.id) & (Chat.user2_id == receiver.id)) |
                    ((Chat.user1_id == receiver.id) & (Chat.user2_id == sender.id))
                ).first()

                if not chat:
                    # If no existing chat, create a new one
                    chat = Chat(user1_id=sender.id, user2_id=receiver.id)
                    db.session.add(chat)
                    db.session.commit()
                    print('New chat created.')

                # Add the message to the Messages table
                new_message = Message(chat_id=chat.id, sent_by=sender.id, message=msg_body)
                db.session.add(new_message)
                db.session.commit()

                print(f"Message sent by {sender_username} to {receiver_username}: {msg_body}")

                # Emit a success response to the sender
                emit('success', {'status': 200, 'result': 'Message sent successfully'})

            except Exception as e:
                print(f"Error sending message: {e}")
                emit('error', {'status': 500, 'result': 'Internal Server Error'})

        elif data['action'] == 'PING':
            print("PING RECEIVED!!")
            output = get_chat_length(get_username_with_authtoken(data['user1']),data['user2'])
            emit('message',{'result':'ping_response','message_count':output['message_count']})

        elif data['action'] == 'CLEAR_CHAT':
            print('Clear chat action initiated.')

            # Extract input details
            authtoken = data['authtoken']
            receiver_username = data['receiver']

            # Validate inputs
            if not authtoken or not receiver_username:
                emit('error', {'status': 400, 'result': 'Invalid input data'})
                return

            try:
                # Verify the sender's auth token and get their username
                sender_username = get_username_with_authtoken(authtoken)
                if isinstance(sender_username, dict) and sender_username.get('status') == 404:
                    emit('error', sender_username)
                    return

                # Retrieve sender and receiver user objects
                sender = db.session.query(User).filter_by(username=sender_username).first()
                receiver = db.session.query(User).filter_by(username=receiver_username).first()

                if not sender or not receiver:
                    emit('error', {'status': 404, 'result': 'Sender or receiver not found'})
                    return

                # Fetch the chat between sender and receiver
                chat = db.session.query(Chat).filter(
                    ((Chat.user1_id == sender.id) & (Chat.user2_id == receiver.id)) |
                    ((Chat.user1_id == receiver.id) & (Chat.user2_id == sender.id))
                ).first()

                if not chat:
                    emit('error', {'status': 404, 'result': 'No chat found between the users'})
                    return

                # Clear all messages associated with the chat
                db.session.query(Message).filter_by(chat_id=chat.id).delete()
                db.session.commit()

                print(f"Chat cleared between {sender_username} and {receiver_username}.")
                emit('success', {'status': 200, 'result': 'Chat cleared successfully'})

            except Exception as e:
                print(f"Error clearing chat: {e}")
                emit('error', {'status': 500, 'result': 'Internal Server Error'})

        else:
            print('received message')
            print(data)
            emit('message', json.dumps({'status': '200', 'result': 'connected'}))
