import { useMemo, useState } from "react";
import "./App.css";
import DarkVeil from "./Darkveil";

// Optional: if you already added DarkVeil, uncomment these:
// import DarkVeil from "./DarkVeil";

function ImgCard({ title, dataUrl }) {
  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${title}.png`;
    a.click();
  };

  return (
    <div className="card">
      <div className="cardTitle">{title}</div>

      {dataUrl ? (
        <img className="resultImg" src={dataUrl} alt={title} />
      ) : (
        <div className="placeholder">Result will appear here</div>
      )}

      <button className="btn" onClick={download} disabled={!dataUrl}>
        Download
      </button>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState(null);

  // mock outputs now, real API later
  const [out, setOut] = useState({
    AlphaAMS: null,
    ArgusII: null,
    PRIMA: null,
  });

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

  const onGenerate = async () => {
    if (!file) return;

    try {
      // Clear old results so you can see it change
      setOut({ AlphaAMS: "", ArgusII: "", PRIMA: "" });

      const fd = new FormData();
      fd.append("file", file);

      console.log("Posting to:", `${API_BASE}/simulate`);

      const res = await fetch(`${API_BASE}/simulate`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("API response keys:", Object.keys(data));

      if (!res.ok) throw new Error(data.detail || "Simulation failed");

      setOut({
        AlphaAMS: `data:image/png;base64,${data.AlphaAMS}`,
        ArgusII: `data:image/png;base64,${data.ArgusII}`,
        PRIMA: `data:image/png;base64,${data.PRIMA}`,
      });
    } catch (err) {
      console.error(err);
      alert(err.message || String(err));
    }
  };

  return (
    <div className="page">
      {/* Optional DarkVeil background */}
      {/* <div className="bgWrap"><DarkVeil /></div> */}

      <div className="bgWrap">
        <DarkVeil
        hueShift={0}
        noiseIntensity={0.03}
        scanlineIntensity={0.15}
        scanlineFrequency={2.0}
        warpAmount={0.2}
        speed={0.5}/>
      </div>

      <div className="panel">
        <div className="panelInner">
          <h1>Alex's Phosphene Vision Simulator based on Pulse2percept</h1>
          <p className="sub">
            Upload a photo in jpg or png format and generate AlphaAMS, ArgusII, and PRIMA simulations.
          </p>

          <div className="row">
            <input
              className="file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button className="btn" onClick={onGenerate} disabled={!file}>
              Generate
            </button>
          </div>

          <div className="grid">
            <ImgCard title="AlphaAMS" dataUrl={out.AlphaAMS} />
            <ImgCard title="ArgusII" dataUrl={out.ArgusII} />
            <ImgCard title="PRIMA" dataUrl={out.PRIMA} />
          </div>
        </div>
      </div>

    </div>
  );
}
