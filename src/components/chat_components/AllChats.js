export default function AllChats({styles, users, accessUserChat}){
    return (
        <div className={styles.chats}>
                <h2 className={styles.heading}>Heading</h2>
                { users.map((user)=>(
                    <div className={styles.user}>
                    <button onClick={()=>accessUserChat(user)} className={styles.userButton}>{user}</button>
                    </div>
                ))}
        </div>
    )
}