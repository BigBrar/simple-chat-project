import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { Navigate } from 'react-router-dom';
import styles from './Login.module.css';

export default function Login(){
  const username = useRef();
  const password = useRef();
  const navigate = useNavigate();

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
    if (data.auth_token){
        console.log("Authtoken = ", data['auth_token']);
        localStorage.setItem('authToken',data['auth_token']);
        navigate('/')
      }

} catch (error) {
    console.error("Error occurred:", error);
}
  }
  return (
    <>
    <div className={styles.mainContainer}>
      
        <form onSubmit={(e)=>sendDataToFlask(e,{url:'http://localhost:5000/auth/login',username:username.current.value, password:password.current.value, email:'none'})} className={styles.loginForm}>
          <h1 style={{fontSize:'1.5rem'}}>Login</h1>
          <input ref={username} className={styles.textInput} type='text' placeholder='Username'/>
          <input ref={password} className={styles.textInput} type='password' placeholder='Password'/>
          <input type='submit' className={styles.submitButton} />
        <Link to='/signup' style={{textDecoration:'none', color:'white', fontSize:'1rem', marginTop:'1rem'}}>Don't have an Account? <span style={{color:'cyan'}}>Sign up here!!!</span></Link>
        </form>
      
    </div>

    </>
  )
}