from flask import Blueprint, request
from models import Chat, User, Message

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/addcontact', methods=['POST'])
def add_contact():
    print('add_contact triggered')
    data = request.get_json()
    sender = User.query.filter_by(auth_token=data['authtoken']).first()
    receiver = User.query.filter_by(username=data['username']).first()

    if not sender or not receiver:
        print('sender or receiver not found')
        return {'status': 404, 'result': 'Sender or receiver not found'}
    
    existing_chat = Chat.query.filter(
        ((Chat.user1_id == sender.id) & (Chat.user2_id == receiver.id)) |
        ((Chat.user1_id == receiver.id) & (Chat.user2_id == sender.id))
    ).first()

    if existing_chat:
        print('Chat already exists')
        return {'status': 400, 'result': 'Chat already exists'}

    new_chat = Chat(user1_id=sender.id, user2_id=receiver.id)
    from config import db
    db.session.add(new_chat)
    db.session.commit()
    return {'status': 200, 'result': 'Chat created'}
