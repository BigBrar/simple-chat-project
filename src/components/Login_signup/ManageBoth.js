import {useEffect, useRef, useState} from 'react';

export default function ManageBoth(){
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
      body: JSON.stringify({ 'username' : credentials.username, 'password' : credentials.password, 'email':credentials.email })
  };
  try {
    const response = await fetch(credentials.url, requestOptions);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status != 200){
        console.log('something went wrong with the request, here is the server response')
        console.log(data.result)
    }
    if (data.authtoken){
        console.log("Authtoken = ", data['authtoken']);
        localStorage.setItem('authToken',data['authtoken']);
        window.location.href = window.location.href;}

} catch (error) {
    console.error("Error occurred:", error);
}
  }
    return (
        <>
        <div className='grid justify-center items-center text-center h-screen bg-black text-black'>
     
     {showLogin && <div className='grid justify-center items-center text-center h-screen bg-black text-black'>
      <h1 onClick={switchAuthenticationMode} className='text-2xl text-white'>Login</h1>
        <form onSubmit={(e)=>sendDataToFlask(e,{url:'http://localhost:5000/login',username:username.current.value, password:password.current.value, email:'none'})} className="grid gap-10 ">
          <input ref={username} className="" type="text" placeholder="Username" />
          <input ref={password} className="" type="password" placeholder="Password" />
          <input className="h-10 w-full bg-blue-500 text-white rounded cursor-pointer" type="submit" value="Submit" />
        </form>
    </div>}
      
      {showSignUP && <div className='grid justify-center items-center text-center h-screen bg-black text-black'>
      <h1 onClick={switchAuthenticationMode} className='text-2xl text-white'>Sign Up</h1>
        <form onSubmit={(e)=>sendDataToFlask(e,{url:'http://localhost:5000/signup',username:signupUsername.current.value, password:signupPassword.current.value, email:email.current.value})} className="grid gap-10 ">
          <input ref={signupUsername} className="" type="text" placeholder="Username" />
          <input ref={email}  className="" type="text" placeholder="Email" />
          <input ref={signupPassword} className="" type="password" placeholder="Password" />
          <input className="" type="password" placeholder="Confirm password" />
          <input className="h-10 w-full bg-blue-500 text-white rounded cursor-pointer" type="submit" value="Submit" />
        </form>
    </div>  }
    </div>
        </>
    )
}