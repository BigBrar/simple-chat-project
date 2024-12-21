import {useEffect, useRef, useState} from 'react';
import './App.css'; 
import ManageBoth from './components/Login_signup/ManageBoth';
import Login from './components/Login_signup/Login';
import Signup from './components/Login_signup/Signup';
// import Socket from './components/Login_signup/socket/Socket';
import ChatInterface from './components/Chat/ChatInterface';

function App() {
  const [authToken, setauthToken] = useState(undefined)
  useEffect(()=>{
    setauthToken(localStorage.getItem('authToken'))
  },[])
  
  return (
   <>
    {!authToken && <Login/>}
    {authToken && <ChatInterface/>}
   </>
  );
}

export default App;
