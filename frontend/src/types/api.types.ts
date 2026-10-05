export type configOptions = {
  path: string;
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  silent?: boolean;
};
