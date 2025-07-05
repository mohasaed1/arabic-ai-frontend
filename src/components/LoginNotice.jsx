import React from "react";

export default function LoginNotice() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
      <p className="text-lg mb-2">You must be logged in to Gate of AI to use the dashboard.</p>
      <a
        href="https://gateofai.com/wp-login.php"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Login Now
      </a>
    </div>
  );
}
