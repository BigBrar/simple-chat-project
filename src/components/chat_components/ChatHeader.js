import css from './components.module.css' 
import { useNavigate } from 'react-router-dom'


export default function ChatHeader({styles,findUser,addNewChat}){
    const navigate = useNavigate();
    return (
        <>
        <div style={{display:'flex', position:'relative',justifyContent:'center', alignItems:'center', gap:'2rem ', margin:'0.5rem'}}>
            <input style={{height:'2.2rem',borderRadius:'5px', textAlign:'center', fontFamily:'cursive'}} ref={findUser} className={styles.findUser} placeholder='Add Username'/>
            <button className={css.AddButton} onClick={addNewChat}>Add</button>
            <div onClick={()=>navigate('/logout')} style={{position:'absolute', right:'10px', top:'0', cursor:'pointer',backgroundColor:'rgb(102, 102, 102)',color:'white',padding:'6px',borderRadius:'5px'}}>
                <p>Logout</p>
            </div>
        </div>
        </>
    )
}