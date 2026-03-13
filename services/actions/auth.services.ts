// services/auth.services.ts
import { authKey } from "@/constants/authKey";
import { decodedToken } from "@/utils/jwt";
import { getFromLocalStorage, setToLocalStorage } from "@/utils/local-storage";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type DecodedUser = {
  userName?: string;
  email?: string;
  role: string;
  [key: string]: any;
};

// services/actions/auth.services.ts
// export const loginUser = async (userInput: string, password: string) => {
//   const isPhoneNumber = /^\d+$/.test(userInput); // Only digits

//   const body = isPhoneNumber
//     ? { contactNo: userInput, password }
//     : { userName: userInput, password };

//   const res = await fetch("https://bm24api.xyz/api/v1/auth/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });

//   if (!res.ok) throw new Error("Login failed");

//   const data = await res.json();
//   const token = data.data.accessToken;

//   console.log(token);
//   setToLocalStorage(authKey, token);
//   if (!token) throw new Error("Token not found");

//   const user = jwtDecode<DecodedUser>(token);
//   console.log(user);
//   return { accessToken: token, user };
// };

export const loginUser = async (email: string, password: string) => {
  const body = { email, password };

  let res: Response;
  try {
    res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error("Network error. Please check your connection.");
  }

  let data: { success?: boolean; message?: string; data?: { accessToken?: string } };
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid response from server.");
  }

  if (!res.ok || !data?.success) {
    throw new Error(data?.message || "Login failed");
  }

  const token = data.data?.accessToken;
  if (!token) throw new Error("Token not found");

  setToLocalStorage(authKey, token);

  const decoded = jwtDecode<DecodedUser>(token);
  const user = {
    ...decoded,
    userName: decoded.userName ?? decoded.email ?? decoded.id ?? "",
    role: decoded.role ?? "user",
  };
  return { accessToken: token, user };
};

type RegisterPayload = {
  name: string;
  userName: string;
  email: string;
  password: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  const body = {
    password: payload.password,
    normalUser: {
      name: payload.name,
      userName: payload.userName,
      email: payload.email,
      gender: "male",
      tenantId: "t-001",
      presentAddress: "1234 Elm Street, Los Angeles, CA",
    },
  };

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(data?.message || "Registration failed");
  }

  return data.data?.[0];
};

export const refreshAccessToken = async () => {
  const res = await fetch("https://bm24api.xyz/api/v1/refresh-token");
  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  const user = jwtDecode<DecodedUser>(data.accessToken);

  return { accessToken: data.accessToken, user };
};

export const getUserInfo = () => {
  const authToken = getFromLocalStorage(authKey);
  //   console.log(authToken);
  if (authToken) {
    const decodedData: any = decodedToken(authToken);
    // console.log(decodedData)
    return {
      ...decodedData,
      role: decodedData?.role?.toLowerCase(),
    };
  } else {
    return "";
  }
};