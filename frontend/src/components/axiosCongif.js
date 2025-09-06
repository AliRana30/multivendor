import axios from "axios";

const api = axios.create({
  baseURL: "https://multivendor-m00n.onrender.com/api",
  withCredentials: true,
});

export default api;

