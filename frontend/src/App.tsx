import { useState } from "react";
import axios from "axios";

const App = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImg(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (phone) formData.append("phone", phone);
    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
    if (img) {
      // must match upload.single("profilepic") on backend
      formData.append("profilepic", img);
    }

    try {
      // don't set Content-Type manually — browser sets boundary
      const res = await axios.post(
        "http://localhost:8000/api/v1/register",
        formData
      );
      setStatus(`Success: ${JSON.stringify(res.data)}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setStatus(
          `Error: ${err.response?.status} ${JSON.stringify(err.response?.data)}`
        );
      } else {
        setStatus(`Error: ${String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Register (image upload test)</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          type="text"
          placeholder="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Date of Birth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <img src={preview} alt="preview" style={{ width: 160, height: 160, objectFit: "cover" }} />
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {status && (
        <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{status}</pre>
      )}
    </div>
  );
};

export default App;
