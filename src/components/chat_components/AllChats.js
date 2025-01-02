import beauty from './components.module.css'

export default function AllChats({styles, users, accessUserChat}){
    return (
        <div className={beauty.chats}>
                <h2 className={beauty.heading}>Your Chats</h2>
                { users.map((user)=>(
                    <div onClick={()=>accessUserChat(user)} className={beauty.user}>
                    <button className={beauty.userButton}>{user}</button>
                    </div>
                ))}
        </div>
    )
}