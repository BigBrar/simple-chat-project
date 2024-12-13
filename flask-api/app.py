import json
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import secrets
import string
from datetime import datetime
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins='*')



app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db' 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    auth_token = db.Column(db.String(120), unique=True, nullable=False)

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    sent_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

def extract_chat(user_id, contact_username):
    try:
        # Get the contact user by username
        contact_user = db.session.query(User).filter_by(username=contact_username).first()
        if not contact_user:
            print(f"Contact user {contact_username} not found.")
            return {'status': 404, 'result': 'Contact user not found'}

        # Retrieve the chat between the logged-in user and the contact
        chat = db.session.query(Chat).filter(
            ((Chat.user1_id == user_id) & (Chat.user2_id == contact_user.id)) |
            ((Chat.user1_id == contact_user.id) & (Chat.user2_id == user_id))
        ).first()

        if not chat:
            print(f"No chat found between user {user_id} and contact {contact_user.id}.")
            return {'status': 404, 'result': 'Chat not found'}

        # Retrieve all messages for the found chat
        messages = db.session.query(Message).filter_by(chat_id=chat.id).order_by(Message.timestamp.asc()).all()

        # Convert messages to a JSON-friendly format
        formatted_messages = [
            {
                'id': message.id,
                'sent_by': message.sent_by,
                'message': message.message,
                'timestamp': message.timestamp.isoformat()
            }
            for message in messages
        ]

        # Return the extracted chat messages
        return {'status': 200, 'result': 'chat_extracted', 'chat': formatted_messages}

    except Exception as e:
        print(f"Error extracting chat: {e}")
        return {'status': 500, 'result': 'Internal Server Error'}


def get_username_with_authtoken(authtoken):
    try:
        # Query the User table for a matching auth token
        user = db.session.query(User).filter_by(auth_token=authtoken).first()
        
        # If no user is found, return an error
        if not user:
            return {'status': 404, 'result': 'Invalid auth token'}
        
        # Return the username if the user is found
        return user.username

    except Exception as e:
        print(f"Error retrieving username: {e}")
        return {'status': 500, 'result': 'Internal Server Error'}


def get_chat_users(username):
    try:
        # Query the database to find the user
        user = db.session.query(User).filter_by(username=username).first()
        if not user:
            return {'status': 404, 'result': 'User not found'}

        # Query the chats table to find all chats involving this user
        user_chats = db.session.query(Chat).filter(
            (Chat.user1_id == user.id) | (Chat.user2_id == user.id)
        ).all()

        # Extract the usernames of the other participants
        chat_users = []
        for chat in user_chats:
            other_user_id = chat.user2_id if chat.user1_id == user.id else chat.user1_id
            other_user = db.session.query(User).filter_by(id=other_user_id).first()
            if other_user:
                chat_users.append(other_user.username)

        return {'status': 200, 'result': 'retrieve_user_chats', 'chat_users': chat_users}

    except Exception as e:
        print(f"Error retrieving chat users: {e}")
        return {'status': 500, 'result': 'Internal Server Error'}


def generate_auth_token(length=32):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(characters) for _ in range(length))

def write_new_user(form):
    # Check for existing username or email
    existing_user = User.query.filter((User.username == form['username']) | (User.email == form['email'])).first()
    if existing_user:
        return {'status': 400, 'result': 'username or email already exists'}

    # Create new user
    new_user = User(
        username=form['username'],
        password=form['password'],  # Ideally, hash the password
        email=form['email'],
        auth_token=generate_auth_token()
    )
    db.session.add(new_user)
    db.session.commit()
    return {'status': 200, 'result': 'new account has been created'}

def verify_login(form):
    user = User.query.filter_by(username=form['username'], password=form['password']).first()
    if user:
        return {'status': 200, 'result': 'login success', 'authtoken': user.auth_token}
    return {'status': 404, 'result': 'invalid username or password'}

def addcontact(receiver_username, sender_authtoken):
    sender = User.query.filter_by(auth_token=sender_authtoken).first()
    receiver = User.query.filter_by(username=receiver_username).first()

    if not sender or not receiver:
        return {'status': 404, 'result': 'sender or receiver not found'}

    # Check if chat already exists
    existing_chat = Chat.query.filter(
        ((Chat.user1_id == sender.id) & (Chat.user2_id == receiver.id)) |
        ((Chat.user1_id == receiver.id) & (Chat.user2_id == sender.id))
    ).first()

    if existing_chat:
        return {'status': 400, 'result': 'chat already exists'}

    # Create new chat
    new_chat = Chat(user1_id=sender.id, user2_id=receiver.id)
    db.session.add(new_chat)
    db.session.commit()
    return {'status': 200, 'result': 'chat created'}

@app.route('/signup', methods=['POST'])
def signup():
    response = write_new_user(request.get_json())
    return response

@app.route('/login', methods=['POST'])
def login():
    response = verify_login(request.get_json())
    return response

@app.route('/addcontact', methods=['POST'])
def add_contact_route():
    data = request.get_json()
    response = addcontact(data['username'], data['authtoken'])
    return response


@socketio.on('connect')
def handle_connect():
    print('received message')
    emit('message', 'connected')

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
        emit('message', json.dumps(chat_users_response))
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
        emit('message', response)
    
    if data['action'] == 'MSG_SEND':
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
        emit('message',{'result':'ping_response'})

    else:
        print('received message')
        print(data)
        emit('message', 'connected')


if __name__ == '__main__':
    socketio.run(app, debug=True)