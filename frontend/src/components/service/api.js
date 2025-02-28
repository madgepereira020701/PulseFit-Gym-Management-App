import axios from 'axios';
import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config';

const API_URL = 'http://localhost:8000';

// Axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000, 
    headers: {
        "content-type": "application/json"
    }
});

// Axios interceptors
axiosInstance.interceptors.request.use(
    function(config) {
        if (config.TYPE?.params) {
            config.params = config.TYPE.params;
        } else if (config.TYPE?.query) {
            config.url = `${config.url}/${config.TYPE.query}`;
        }
        return config;
    },
    function(error) {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    function(response) {
        return processResponse(response);
    },
    function(error) {
        return Promise.reject(ProcessError(error));
    }
);

// Response processing
const processResponse = (response) => {
    if (response?.status === 200) {
        return { isSuccess: true, data: response.data };
    } else {
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code
        };
    }
};

const ProcessError = (error) => {
    if (error.response) {
        console.error("ERROR IN RESPONSE:", error.response);
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.responseFailure,
            code: error.response.status
        };
    } else if (error.request) { 
        console.error("ERROR IN REQUEST:", error.request);
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.requestFailure,
            code: ""
        };
    } else { 
        console.error("GENERAL ERROR:", error.message);
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.networkError,
            code: ""
        };
    }
};

// Dynamic API methods via axios
const API = {};

for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) =>
        axiosInstance({
            method: value.method,
            url: value.url,
            data: body,
            responseType: value.responseType,
            onUploadProgress: function (progressEvent) {
                if (showUploadProgress) {
                    let percentageCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showUploadProgress(percentageCompleted);
                }
            },
            onDownloadProgress: function (progressEvent) {
                if (showDownloadProgress) {
                    let percentageCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showDownloadProgress(percentageCompleted);
                }
            }
        });
}

// Adding fetch-based methods to the same API object
API.adminRegister = async (userData) => {
    const response = await fetch('http://localhost:3000/api/adminregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return await response.json();
};

API.memberRegister = async (userData) => {
    const response = await fetch('http://localhost:3000/api/memberregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return await response.json();
};


API.employeeRegister = async (userData) => {
    const response = await fetch('http://localhost:3000/api/employeeregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return await response.json();
};

API.adminLogin = async (loginData) => {
    const response = await fetch('http://localhost:3000/api/adminlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
    });
    return await response.json();
};

API.memberLogin = async (loginData) => {
    const response = await fetch('http://localhost:3000/api/memberlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
    });
    return await response.json();
};

API.employeeLogin = async (loginData) => {
    const response = await fetch('http://localhost:3000/api/employeelogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
    });
    return await response.json();
};

API.passwordresetrequest = async (passwordresetrequestData) => {
    console.log("Request data being sent:", passwordresetrequestData); // Log data

    const response = await fetch('http://localhost:3000/api/passwordresetrequest', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordresetrequestData),
    });
    
    if(!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    
return await response.json();
}

API.updatePassword = async (token, resetpassword) => {
    const response = await fetch(`http://localhost:3000/api/resetpassword/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetpassword),

    });
   return await response.json();
}
export { API };
