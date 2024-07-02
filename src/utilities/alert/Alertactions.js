import axiosInstance from "../../services/axiosInstance";

export const Acknowledgealert = (alertids) => {
    const api = axiosInstance()
    console.log(alertids)
    alertids.forEach(async (alertid) => {
        try {
            const response = await axiosInstance.post('/acknowledge', { id: alertid });
            console.log(`Alert ${alertid} acknowledged:`, response.data);
        } catch (error) {
            console.error(`Failed to acknowledge alert ${alertid}:`, error);
        }
    });

};