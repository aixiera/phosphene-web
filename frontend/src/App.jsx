import { useMemo, useState } from "react";
import "./App.css";

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

  const onGenerate = () => {
    if (!previewUrl) return;
    setOut({
      AlphaAMS: previewUrl,
      ArgusII: previewUrl,
      PRIMA: previewUrl,
    });
  };

  return (
    <div className="page">
      {/* Optional DarkVeil background */}
      {/* <div className="bgWrap"><DarkVeil /></div> */}

      <div className="panel">
        <div className="panelInner">
          <h1>Phosphene Vision Simulator</h1>
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
