"use client";
import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

const TextAnalyzer = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const analyzeText = async () => {
    if (!text.trim()) {
      setError("Dale, escribí algo y te lo analizo!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Error al analizar el texto");
      }

      const data = await response.json();
      setResult(data);
      console.log(data)
    } catch (err) {
      setError("Se nos rompió todo. Cruzá los dedos y probá devuelta.");
    } finally {
      setLoading(false);
    }
  };

  const getStyle = (isArgentinian) => {
    const baseStyle = "p-4 rounded-lg border transition-colors duration-200 ";
    if (darkMode) {
      switch (isArgentinian) {
        case true:
          return baseStyle + "bg-green-950 border-green-700 text-green-100";
        case false:
          return baseStyle + "bg-red-950 border-red-700 text-red-100";
        default:
          return baseStyle + "bg-gray-800 border-gray-700 text-gray-100";
      }
    } else {
      switch (isArgentinian) {
        case true:
          return baseStyle + "bg-green-50 border-green-200 text-green-900";
        case false:
          return baseStyle + "bg-red-50 border-red-200 text-red-900";
        default:
          return baseStyle + "bg-gray-50 border-gray-200 text-gray-900";
      }
    }
  };

  const setConfidenceEmoji = (confidence) => {
    switch (confidence) {
      case 3:
        return "⭐⭐⭐";
      case 2:
        return "⭐⭐";
      case 1:
        return "⭐";
      default:
        return "🤔";
    }

  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
    >
      <div className="max-w-2xl w-full mx-auto p-4">
        <div
          className={`rounded-lg shadow-xl overflow-hidden transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"
            }`}
        >
          {/* Header with Dark Mode Toggle */}
          <div
            className={`p-6 border-b transition-colors duration-200 ${darkMode ? "border-gray-700" : "border-gray-200"
              }`}
          >
            <div className="flex justify-between items-center">
              <h1
                className={`text-2xl font-bold transition-colors duration-200 ${darkMode ? "text-white" : "text-gray-800"
                  }`}
              >
                Analizador de Español Argentino
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors duration-200 ${darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5 text-yellow-300" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <textarea
              placeholder="Escribí tu texto acá..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full h-48 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 transition-colors duration-200 ${darkMode
                ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
                }`}
            />

            <button
              onClick={analyzeText}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-200
                ${loading
                  ? "bg-blue-600 cursor-not-allowed opacity-70"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Analizando..." : "Analizar texto"}
            </button>

            {error && (
              <div
                className={`p-4 rounded-lg border transition-colors duration-200 ${darkMode
                  ? "bg-red-950 border-red-700 text-red-100"
                  : "bg-red-50 border-red-200 text-red-800"
                  }`}
              >
                <p className="font-bold">Error 🚨📢🔔</p>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className={getStyle(result.isArgentinian)}>
                <div className="space-y-2">
                  <p className="font-bold text-lg">
                    {result.isArgentinian
                      ? "Este texto es bien argento! 🧉"
                      : "Este texto no parece ser argento 💔"}
                  </p>
                  <p className="">
                    Nivel de confianza: {setConfidenceEmoji(result.confidence)}
                  </p>
                  {result.details && (
                    <p className="mt-4">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzer;
