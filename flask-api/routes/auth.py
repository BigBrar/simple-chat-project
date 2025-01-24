from flask import Blueprint, request
from models import User
from utils.utils import generate_auth_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return {'status': 400, 'result': 'Username or email already exists'}
    
    new_user = User(
        username=data['username'],
        password=data['password'],  # Use hashing in production
        email=data['email'],
        auth_token=generate_auth_token()
    )
    from config import db
    db.session.add(new_user)
    db.session.commit()
    return {'status': 200, 'result': 'Account created'}

@auth_bp.route('/login', methods=['POST'])
def login():
    print('login function ran!!!')
    data = request.get_json()
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    if user:
        print('user found')
        return {'status': 200, 'result': 'Login successful', 'auth_token': user.auth_token}
    print('user not found')
    if not User.query.filter_by(username=data['username']).first():
        print('username not found')
    else:
        print('incorrect password')
    return {'status': 404, 'result': 'Invalid username or password'}
