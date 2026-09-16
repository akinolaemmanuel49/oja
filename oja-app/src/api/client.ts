import { BASE_URL } from "@/config";
import { createHttpClient } from "@oja/data";

const { instance, get, getList, post, put, patch, delete: del } = createHttpClient({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Backward-compatible default export: the raw axios instance.
// Existing API modules rely on `const { data } = await apiClient.get(...)`.
const apiClient = instance;

export { get, getList, post, put, patch, del };

export default apiClient;
