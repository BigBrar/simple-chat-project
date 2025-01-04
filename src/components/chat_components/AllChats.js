import beauty from './components.module.css'

export default function AllChats({styles, users, accessUserChat, currentChat}){
    return (
        <div className={beauty.chats}>
                <h2 className={beauty.heading}>Your Chats</h2>
                { users.map((user)=>(
                    <>
                    {user != currentChat && <div key={user} onClick={()=>accessUserChat(user)} className={beauty.user}>
                    <button className={beauty.userButton}>{user}</button>
                    </div>}

                    {user == currentChat && <div style={{backgroundColor:'#81e1f0',color:'black',borderRadius:'15px'}} key={user} onClick={()=>accessUserChat(user)} className={beauty.user}>
                    <button className={beauty.userButton}>{user}</button>
                    </div>}

                    </>
                ))}
        </div>
    )
}