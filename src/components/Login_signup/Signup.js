import { useRef } from 'react';
import styles from './Login.module.css';

export default function Login(){
  const username = useRef();
  const password = useRef();
  const email = useRef();

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
    if (data.result == 'account_created'){
        alert('user account created, login with same credentials.')
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
    <div className={styles.mainContainer}>
      
        <form onSubmit={(e)=>sendDataToFlask(e,{url:'http://localhost:5000/signup',username:username.current.value, password:password.current.value, email:email.current.value})} className={styles.loginForm}>
          <h1 style={{fontSize:'1.5rem'}}>Sign Up</h1>
          <input ref={username} className={styles.textInput} type='text' placeholder='Username'/>
          <input ref={email} className={styles.textInput} type='email' placeholder='Email'/>
          <input ref={password} className={styles.textInput} type='password' placeholder='Password'/>
          <input type='submit' className={styles.submitButton} />
        </form>
      
    </div>
  )
}