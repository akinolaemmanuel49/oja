import { BASE_URL } from "@/config";
import { createHttpClient } from "@oja/data";
import { getDeviceId } from "@/lib/deviceId";

const { instance, get, getList, post, put, patch, delete: del } = createHttpClient({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Backward-compatible default export: the raw axios instance.
// Existing API modules rely on `const { data } = await apiClient.get(...)`.
const apiClient = instance;

// Attach the guest device id so designer previews share the guest cart
// with the public storefront (which uses the same device_id cookie).
apiClient.interceptors.request.use((config) => {
  config.headers.set("X-Device-Id", getDeviceId());
  return config;
});

export { get, getList, post, put, patch, del };

export default apiClient;
