import {useEffect, useRef, useState} from 'react';
import './App.css'; 
import { Routes, Route } from 'react-router-dom';
import ManageBoth from './components/Login_signup/ManageBoth';
import Login from './components/Login_signup/Login';
import { useNavigate } from 'react-router-dom';
import Signup from './components/Login_signup/Signup';
// import Socket from './components/Login_signup/socket/Socket';
import ChatInterface from './components/Chat/ChatInterface';
import Logout from './components/Login_signup/Logout';

function App() {
  const [authToken, setauthToken] = useState(undefined)
  useEffect(()=>{
    setauthToken(localStorage.getItem('authToken'))
  },[])

  function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    useEffect(() => {
      const token = localStorage.getItem('authToken'); 
      if (token) {
        // You might want to add a check here to verify the token on your backend
        setIsLoggedIn(true); 
      } else {
        navigate('/login'); 
      }
    }, []); 
  
    if (!isLoggedIn) {
      return null; 
    }
  
    return children;
  }

  
  return (
   <>
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
        <ChatInterface/>
        </ProtectedRoute>
        } />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup/>} />
      <Route path='/logout' element={<Logout/>}/>
    </Routes>
    {/* {!authToken && <Login/>}
    {authToken && <ChatInterface/>} */}
   </>
  );
}

export default App;
