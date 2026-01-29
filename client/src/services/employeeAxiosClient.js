import axios from "axios";

const employeeAxiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

employeeAxiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("employee_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

employeeAxiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      const { response } = error;
      if (response.status === 401) {
        localStorage.removeItem("employee_token");
      }
    } catch (e) {
      console.log(e);
    }

    throw error;
  },
);

export default employeeAxiosClient;
