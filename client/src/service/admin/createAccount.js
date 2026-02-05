import axios from "axios";
import { SERVER_URL } from "hooks/serverUrl";
const createAccount = async ({
    fullname,
    department,
    role,
    email,
    username,
    password
}) => {
    try{
        const response = await axios.post(`${SERVER_URL}/admin/create-account`, {
            fullname: fullname,
            department:department,
            role: role,
            email: email,
            username: username,
            password:password,
        });
        console.log("Create Account Response", response)
    }catch(error){
        console.log("message", error);
    }
}
export default createAccount;