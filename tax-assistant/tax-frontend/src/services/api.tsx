import axios from 'axios';

// TypeScript साठी आपण सांगतो की ही एक स्ट्रिंग आहे
const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // हे सुनिश्चित करते की कुकीज सर्व्हरला पाठवले जातील
});

export default api;