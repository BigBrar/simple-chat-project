import json
from flask import Flask, request, redirect
from flask_cors import CORS
import secrets
import string

def generate_auth_token(length=32):
    characters = string.ascii_letters + string.digits + string.punctuation
    token = ''.join(secrets.choice(characters) for _ in range(length))
    
    return token


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
    print('Form = ',form)
    authtoken = generate_auth_token()
    with open('auth-lab.json','w')as file:
        json.dump({
            'username':form['entered_username'],
            'password':form['entered_password'],
            'authtoken':authtoken
            },file)
    return {
        'status':200,
        'result':'login success',
        'authtoken':authtoken
        }

@app.route('/signup',methods=['POST'])
def post_method():
    form = request.get_json()
    username = form['entered_username']
    password = form['entered_password']
    return "you ahve been submitted "

if __name__ == '__main__':
    app.run(debug=True)