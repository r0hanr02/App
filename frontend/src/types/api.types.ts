export type configOptions = {
    path: string;
    method: "POST" | "GET" | "PUT" | "PATCH";
    data?: unknown;
    headers?: Record<string, string>;
    withCredential?: boolean;
  };
  