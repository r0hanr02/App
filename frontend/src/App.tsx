import axios from "axios";
import { useState } from "react";

function App() {
  const [img, setImg] = useState<File | null>(null);
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData();
    if (img) {
      formData.append("file", img);
    }
    formData.append("text", text);

    axios.post("http://localhost:8000/api/v1/me", formData);
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] ?? null;
            setImg(selectedFile);
          }}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Upload</button>
      </form>
    </>
  );
}

export default App;
