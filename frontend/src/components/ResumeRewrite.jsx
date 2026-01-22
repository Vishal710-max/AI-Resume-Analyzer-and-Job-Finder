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
  <div className="w-full max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <span className="text-3xl">✨</span>
        AI Resume Rewrite
      </h2>

      <div className="space-y-5">
        {/* Target Job Role Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Target Job Role
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 text-slate-900 placeholder-slate-400"
            placeholder="e.g. Senior Data Analyst, Frontend Developer, Product Manager"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        {/* Resume Text Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Paste Resume Text
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 text-slate-900 placeholder-slate-400 resize-none"
            placeholder="Paste your resume summary, experience description, or project details that you want to optimize..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="6"
          />
        </div>

        {/* Rewrite Button */}
        <button
          onClick={rewrite}
          disabled={loading}
          className={`w-full px-6 py-4 rounded-lg font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
            loading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Rewriting...</span>
            </>
          ) : (
            <>
              <span className="text-lg">✨</span>
              <span>Rewrite with AI</span>
            </>
          )}
        </button>

        {/* Output Section */}
        {output && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Rewritten Output
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={copyToClipboard} 
                  className="px-4 py-2 bg-white text-slate-700 hover:text-slate-900 rounded-lg text-sm font-medium border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <span>📋</span>
                  Copy
                </button>
                <button 
                  onClick={downloadText} 
                  className="px-4 py-2 bg-white text-slate-700 hover:text-slate-900 rounded-lg text-sm font-medium border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <span>⬇️</span>
                  Download
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{output}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}