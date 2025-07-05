import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

export default function FileUpload({ jwt }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    axios.post("https://api.gateofai.com/analyze", formData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "multipart/form-data"
      }
    })
    .then(response => {
      alert("✅ Analysis complete!");
      console.log(response.data);
      setUploading(false);
    })
    .catch(err => {
      console.error(err);
      alert("❌ Upload failed.");
      setUploading(false);
    });
  }, [jwt]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="border-dashed border-4 border-gray-300 p-6 text-center rounded-lg hover:bg-gray-50 cursor-pointer"
    >
      <input {...getInputProps()} />
      <p className="text-lg">📂 Drag & drop a file here, or click to select</p>
      {uploading && <p className="mt-2 text-blue-600">Uploading...</p>}
    </div>
  );
}
