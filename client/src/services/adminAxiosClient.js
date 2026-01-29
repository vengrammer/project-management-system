import axios from "axios";

const adminAxiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

adminAxiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminAxiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      const { response } = error;
      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        console.log("dito naman pag d auth");
      }
    } catch (e) {
      console.log(e);
    }
    throw error;
  },
);

export default adminAxiosClient;