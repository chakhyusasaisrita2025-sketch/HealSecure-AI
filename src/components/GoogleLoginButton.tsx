import React from "react";
import { GoogleLogin } from "@react-oauth/google";

export const GoogleLoginButton: React.FC = () => {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log("GOOGLE LOGIN SUCCESS");
        console.log("Credential:", credentialResponse.credential);
      }}
      onError={() => {
        console.error("GOOGLE LOGIN FAILED");
      }}
    />
  );
};