import api from '../../services/api';

const API_URL = '/api/auth';

// Register user
const register = async (userData: any) => {
    const response = await api.post(`${API_URL}/register`, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Login user
const login = async (userData: any) => {
    const response = await api.post(`${API_URL}/login`, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Logout user
const logout = async () => {
    await api.post(`${API_URL}/logout`);
    localStorage.removeItem('user');
};

const authService = {
    register,
    logout,
    login,
};

export default authService;
