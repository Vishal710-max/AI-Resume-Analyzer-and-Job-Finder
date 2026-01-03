import { useState } from "react";
import axios from "axios";

export default function ResumeRewrite() {
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const rewrite = async () => {
    if (!text.trim() || !role.trim()) {
      alert("Please enter text and target role.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/rewrite", {
        text,
        target_role: role,
      });
      setOutput(res.data.rewritten);
    } catch (err) {
      console.error(err);
      alert("Error rewriting text. Please check if the backend server is running.");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert("Copied to clipboard!");
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "rewritten-resume.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="rewrite-container">
      <div className="rewrite-card">
        <h2 className="rewrite-title">
          <span className="rewrite-icon">✨</span>
          AI Resume Rewrite
        </h2>

        <div className="input-group">
          <label className="input-label">Target Job Role</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Senior Data Analyst, Frontend Developer, Product Manager"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Paste Resume Text</label>
          <textarea
            className="textarea-field"
            placeholder="Paste your resume summary, experience description, or project details that you want to optimize..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="6"
          />
        </div>

        <button
          onClick={rewrite}
          disabled={loading}
          className={`rewrite-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Rewriting...
            </>
          ) : (
            '✨ Rewrite with AI'
          )}
        </button>

        {output && (
          <div className="output-container">
            <div className="output-header">
              <h3 className="output-title">Rewritten Output</h3>
              <div className="output-actions">
                <button onClick={copyToClipboard} className="action-button">
                  📋 Copy
                </button>
                <button onClick={downloadText} className="action-button">
                  ⬇️ Download
                </button>
              </div>
            </div>
            <div className="output-content">
              <p>{output}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}