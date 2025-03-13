import axios from 'axios';
import { store } from "../redux/store/store"
const axiosInstance = axios.create({
    baseURL: 'https://wati-sender-backend.vercel.app/',
    // baseURL: 'https://wa-wati-backend.vercel.app/',
});
axiosInstance.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state.auth.token;
    const isMultipartData = config.headers['Content-Type'] === 'multipart/form-data';
    config.headers = {
        'Content-Type': isMultipartData ? 'multipart/form-data' : 'application/json',
        Authorization: `Bearer ${token}`,
        'Access-Control-Allow-Origin': '*',
    };
    return config;
}, (error) => {

    return Promise.reject(error);
});
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('axiosInstance error - ' + JSON.stringify(error));
        if (error.response) {
            if (error.response.status === 401) {
                console.log('Authentication Failed');
                localStorage.removeItem('persist:auth');
                window.location.href = '/';
            }
        } else {
            console.log('Network error or no response from server');
        }
        return Promise.reject(error); // Ensure the error is still returned
    }
);
export default axiosInstance;