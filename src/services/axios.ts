// src/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com", // Replace with your API base URL
});

export default axiosInstance;
