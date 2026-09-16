import apiClient from "@/api/client";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) history.push("/unauthorized");
    if (status === 403) history.push("/forbidden");

    return Promise.reject(err);
  },
);
