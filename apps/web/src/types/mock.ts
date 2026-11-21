export type ThemeMode = "dark" | "light" | "warm";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ActiveTab = "endpoints" | "logs" | "docs";

export type RuleConditionType = "header" | "body" | "query";

export type AuthType = "inherit" | "none" | "bearer" | "api_key" | "basic";

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface CookieItem {
  id: string;
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  enabled: boolean;
}

export interface EndpointAuth {
  type: AuthType;
  token: string;
  headerName: string;
  username: string;
  password: string;
}

export interface MockEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  delayMs: number;
  responseBody: string;
  params: KeyValueItem[];
  auth: EndpointAuth;
  headers: KeyValueItem[];
  cookies: CookieItem[];
}

export interface EndpointRule {
  id: string;
  priority: number;
  conditionType: RuleConditionType;
  conditionKey: string;
  operator: "exists" | "equals" | "not_matches";
  expectedValue: string;
  overrideStatus: number;
}

export interface RequestLog {
  id: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  delayMs: number;
  timestamp: string;
}

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  isProtected: boolean;
  defaultAuth: EndpointAuth;
  envVars: KeyValueItem[];
  defaultHeaders: KeyValueItem[];
  endpoints: MockEndpoint[];
  rules: EndpointRule[];
  logs: RequestLog[];
}
