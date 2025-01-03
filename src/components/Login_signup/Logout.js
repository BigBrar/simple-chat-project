import { useNavigate } from "react-router-dom";
export default function Logout(){
    const navigate = useNavigate();
    localStorage.removeItem('authToken');
    navigate('/');
    return (
        <p>You have been successfully logged out!!!</p>
    )
}