import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    timeout: 15000,
});

// Auto attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

export const claimsApi = {
    submit:     (claimData, itemsData) => api.post('/reimbursements/', { claim: claimData, items: itemsData }),
    getPending: (role)                 => api.get(`/expenses/pending`),
    decide:     (claimId, payload)     => api.post(`/approval/${claimId}/decide`, payload),
    getHistory: (claimId)              => api.get(`/approval/${claimId}/history`),
};

export const currencyApi = {
    convert:    (amount, from, to)            => api.get('/currency/convert', { params: { amount, from, to } }),
    getRates:   ()                            => api.get('/currency/rates'),
    updateRate: (currency_code, rate_to_usd)  => api.put('/currency/rates', { currency_code, rate_to_usd }),
};

export const authApi = {
    login:    (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

export const analyticsApi = {
    getSummary:    () => api.get('/analytics/summary'),
    getByCategory: () => api.get('/analytics/by-category'),
    getDashboard:  () => api.get('/dashboard/dashboard'),
};
