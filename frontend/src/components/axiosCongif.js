import axios from "axios";

const api = axios.create({
  baseURL: "https://multivendors-7cy2.onrender.com/api",
  withCredentials: true,
});

export default api;

