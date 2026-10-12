import axios from 'axios';

const api = axios.create({
    baseURL: `http://${window.location.hostname}:9000/user`, // Dynamically resolve backend host
});

export default api;
