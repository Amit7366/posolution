// utils/jwt.ts
import { jwtDecode } from "jwt-decode";

export const getUserFromToken = (token: string) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

type TUser = {
  id: string;
  email: string;
  role: string;
  contactNo: string;
  userName: string;
  objectId: string;
  iat: number;
  exp: number;
  // Add other fields based on your JWT payload structure
}

export const decodedToken = (token: string): TUser => {
  try {
    // Decode the token into a custom object
    const decoded = jwtDecode<TUser>(token);  // Type-casting to DecodedToken

    // Ensure you get the right user fields (e.g., email, role)
    return {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      contactNo: decoded.contactNo,
      userName:  decoded.userName,
      objectId: decoded.objectId,
      iat: decoded.iat,
      exp: decoded.exp
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    throw new Error("Invalid token specified");
  }
};