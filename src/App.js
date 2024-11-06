import {useRef, useState} from 'react';
import './App.css'; 

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUP, setshowSignUP] = useState(true)
  const username = useRef()
  const signupUsername = useRef()
  const signupPassword = useRef()
  const email = useRef()
  const password = useRef()

  const switchAuthenticationMode = ()=>{
    if (showLogin){
      setShowLogin(false)
      setshowSignUP(true)
    }
    else{
      setshowSignUP(false)
      setShowLogin(true)
    }
  }

  const sendDataToFlask = async(e, credentials)=>{
    e.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'entered_username' : credentials.username, 'entered_password' : credentials.password })
  };
  try {
    const response = await fetch(credentials.url, requestOptions);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Authtoken = ", data['authtoken']);

} catch (error) {
    console.error("Error occurred:", error);
}
  }
  return (
   <>
    <div className='grid justify-center items-center text-center h-screen bg-black text-black'>
     
     {showLogin && <div className='grid justify-center items-center text-center h-screen bg-black text-black'>
      <h1 onClick={switchAuthenticationMode} className='text-2xl text-white'>Login</h1>
        <form onSubmit={(e)=>sendDataToFlask(e,{url:'http://localhost:5000/login',username:username.current.value, password:password.current.value})} className="grid gap-10 ">
          <input ref={username} className="" type="text" placeholder="Username" />
          <input ref={password} className="" type="password" placeholder="Password" />
          <input className="h-10 w-full bg-blue-500 text-white rounded cursor-pointer" type="submit" value="Submit" />
        </form>
    </div>}
      
      {showSignUP && <div className='grid justify-center items-center text-center h-screen bg-black text-black'>
      <h1 onClick={switchAuthenticationMode} className='text-2xl text-white'>Sign Up</h1>
        <form onSubmit={(e)=>sendDataToFlask(e,{url:'http://localhost:5000/signup',username:signupUsername.current.value, password:signupPassword.current.value, email:email})} className="grid gap-10 ">
          <input ref={signupUsername} className="" type="text" placeholder="Username" />
          <input ref={signupPassword} className="" type="text" placeholder="Email" />
          <input ref={email} className="" type="password" placeholder="Password" />
          <input className="" type="password" placeholder="Confirm password" />
          <input className="h-10 w-full bg-blue-500 text-white rounded cursor-pointer" type="submit" value="Submit" />
        </form>
    </div>  }
    </div>
   </>
  );
}

export default App;
