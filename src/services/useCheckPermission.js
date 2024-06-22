// useCheckPermission.js
import { useNavigate } from 'react-router-dom';
import useAxios from './useAxios';
import { useAuth } from '../auth/AuthContext';

function useCheckPermission(componentName) {

    console.log("Component is ", componentName)
    const navigate = useNavigate()
    const { role } = useAuth();

    const api = useAxios();
    const fecthPermissions = async () => {
        try {
            console.log(role)
            const response = await api.get("/api/permissions");
            console.log(response.data);
            const permission = response.data['permissions'][role]
            console.log(permission)
            if (!permission) {
                navigate("/accessdenied")
                return
            }
            if (permission && !permission.includes(componentName)) {
                navigate("/accessdenied")
                return
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };
    return fecthPermissions;
};

export default useCheckPermission;
