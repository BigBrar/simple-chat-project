import json
from flask import Flask, request, redirect
from flask_cors import CORS
import secrets
import string

def generate_auth_token(length=32):
    characters = string.ascii_letters + string.digits + string.punctuation
    token = ''.join(secrets.choice(characters) for _ in range(length))
    
    return token

def get_username_with_authtoken(authtoken):
    with open('users.json','r')as file:
            data = json.load(file)
    for user in data:
        if user['authtoken'] == authtoken:
            username = user['username']
            return username
    print({'status':404, 'result':'invalid authtoken'})
    return {'status':404, 'result':'invalid authtoken'}

def read_file():
    with open('users.json','r')as file:
        data = json.load(file)
        return data

def write_new_user(form):
    data = read_file()
    new_user = {
        'username':form['username'], 
        'password':form['password'], 
        'email':form['email'], 
        'authtoken': generate_auth_token()
        }
    for user in data:
        if user['username'] == form['username'] or user['email'] == form['email']:
            return {'status':400, 'result':'username or email already exists' }
    data.append(new_user)
    with open('users.json','w')as file:
        json.dump(data,file)
    with open('chats.json','r')as file:
        chats = json.load(file)
    chats.append({"username": new_user['username'],"chats": []})
    with open('chats.json','w')as file:
        json.dump(chats,file)
    return {'status':200, 'result':'new account has been created' }

def verify_login(form):
    data = read_file()
    for user in data:
        if user['username'] == form['username'] and user['password'] == form['password']:
            return {'status':200, 'result':'login success', 'authtoken':user['authtoken'] }
    return {'status':404, 'result':'invalid username or password' }
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route('/')
def main_route():
    return "You should not be here my friend !!!"

@app.route('/login',methods=['POST','GET'])
def method_login():
    if request.method == 'GET':
        return 'wrong method my friend, WRONG METHOD !!'
    form = request.get_json()
    response = verify_login(form)
    return response 

@app.route('/signup',methods=['POST'])
def post_method():
    response = write_new_user(request.get_json())
    return response

@app.route('/addcontact',methods=['POST'])
def addcontact():
    receiver = request.get_json()['username']
    authtoken = request.get_json()['authtoken']
    sender = get_username_with_authtoken(authtoken)
    with open('chats.json','r')as file:
        data = json.load(file)
    for user in data:
        if user['username'] == sender:
            user['chats'].append({'username':receiver, 'messages':[]})
        for user in data:
            if user['username'] == receiver:
                user['chats'].append({'username':sender, 'messages':[]})
        with open('chats.json','w')as file:
            json.dump(data,file)
            return {'status':200, 'result':'chat created.'}
    return {'status':503, 'result':'something went wrong'}

if __name__ == '__main__':
    app.run(debug=True)