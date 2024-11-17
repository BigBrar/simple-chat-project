from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import secrets
import string
from datetime import datetime

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run()