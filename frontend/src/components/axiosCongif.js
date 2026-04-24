import axios from "axios";

const server = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const backend_url = `${server}/api`;

const api = axios.create({
  baseURL: backend_url,
  withCredentials: true,
});

export { server, backend_url };
export default api;
