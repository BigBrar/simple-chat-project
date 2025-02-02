import { useRef } from 'react';
import styles from './Login.module.css';
import {Link} from 'react-router-dom';

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
    const data = await response.json();
    if(data.status == 400){
      alert("Username or password already exists.")
    }
    else if (data.result == 'something_already_exists'){
        alert("Username or password already exists.")
    }
    else if (data.result == 'account_created'){
        alert('user account created, login with same credentials.')
    }

} catch (error) {
    console.error("Error occurred:", error);
}
  }
  return (
    <div className={styles.mainContainer}>
      
        <form onSubmit={(e)=>sendDataToFlask(e,{url:'https://localhost:5000/auth/signup',username:username.current.value, password:password.current.value, email:email.current.value})} className={styles.loginForm}>
          <h1 style={{fontSize:'1.5rem'}}>Sign Up</h1>
          <input ref={username} className={styles.textInput} type='text' placeholder='Username'/>
          <input ref={email} className={styles.textInput} type='email' placeholder='Email'/>
          <input ref={password} className={styles.textInput} type='password' placeholder='Password'/>
          <input type='submit' className={styles.submitButton} />
          <Link to='/login' style={{textDecoration:'none', color:'white', fontSize:'1rem', marginTop:'1rem'}}>Already have an account?<span style={{color:'cyan'}}>Login here!!!</span></Link>
        </form>
      
    </div>
  )
}