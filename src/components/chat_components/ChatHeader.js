import css from './components.module.css' 


export default function ChatHeader({styles,findUser,addNewChat}){
    return (
        <>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'2rem ', margin:'0.5rem'}}>
            <input style={{height:'2.2rem',borderRadius:'5px', textAlign:'center', fontFamily:'cursive'}} ref={findUser} className={styles.findUser} placeholder='Add Username'/>
            <button className={css.AddButton} onClick={addNewChat}>Add</button>
        </div>
        </>
    )
}