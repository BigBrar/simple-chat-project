from models import User, Chat, Message
from config import db
import secrets
import string

def generate_auth_token(length=32):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

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
                'sent_by': db.session.query(User).filter_by(id=message.sent_by).first().username,
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
    

def get_chat_length(user1_username, user2_username):
    """
    Get the total number of messages in the chat between two users.
    """
    try:
        # Retrieve the user objects for both users
        user1 = db.session.query(User).filter_by(username=user1_username).first()
        user2 = db.session.query(User).filter_by(username=user2_username).first()

        if not user1 or not user2:
            return {'status': 404, 'message': 'One or both users not found'}

        # Find the chat between the two users
        chat = db.session.query(Chat).filter(
            ((Chat.user1_id == user1.id) & (Chat.user2_id == user2.id)) |
            ((Chat.user1_id == user2.id) & (Chat.user2_id == user1.id))
        ).first()

        if not chat:
            return {'status': 200, 'message_count': 0}  # No chat means no messages

        # Count the total number of messages in the chat
        message_count = db.session.query(Message).filter_by(chat_id=chat.id).count()

        return {'status': 200, 'message_count': message_count}

    except Exception as e:
        print(f"Error retrieving chat length: {e}")
        return {'status': 500, 'message': 'Internal Server Error'}
