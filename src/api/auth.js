export async function fetchJWT() {
  try {
    const res = await fetch("https://gateofai.com/wp-json/gateofai/v1/token", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Not logged in");
    return await res.json();
  } catch (err) {
    console.error("JWT fetch failed:", err);
    return null;
  }
}
