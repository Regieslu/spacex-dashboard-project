import axios from "axios";

export const api = axios.create({ baseURL: "/api" });
export const getLaunches = () => api.get("/launches").then((res) => res.data);
export const getRockets = () => api.get("/rockets").then((res) => res.data);
export const getStarlink = () => api.get("/starlink").then((res) => res.data);
export const getNextLaunches = () =>
  api.get("/launches/next").then((res) => res.data);
