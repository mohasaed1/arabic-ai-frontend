import React from "react";
import FileUpload from "./FileUpload";
import Results from "./Results";

export default function Dashboard({ jwt, user }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">📊 Gate of AI Dashboard</h1>
      <p className="mb-6 text-gray-600">Welcome {user.email}!</p>
      <FileUpload jwt={jwt} />
      <Results jwt={jwt} />
    </div>
  );
}
