import {useEffect, useRef, useState} from 'react';
import './App.css'; 
import ManageBoth from './components/Login_signup/ManageBoth';

function App() {
  const [authToken, setauthToken] = useState(undefined)
  useEffect(()=>{
    setauthToken(localStorage.getItem('authToken'))
  },[])
  
  return (
   <>
    {!authToken && <ManageBoth/>}
    {authToken && <p>You have properly logged in</p>}
   </>
  );
}

export default App;
