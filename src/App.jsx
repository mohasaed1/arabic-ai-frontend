import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import LoginNotice from "./components/LoginNotice";
import { fetchJWT } from "./api/auth";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJWT()
      .then(data => {
        if (data) {
          setToken(data.token);
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-10 text-xl">🔄 Loading Gate of AI...</div>;

  return token ? <Dashboard jwt={token} user={user} /> : <LoginNotice />;
}
