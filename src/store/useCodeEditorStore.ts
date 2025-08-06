import { create } from "zustand";
import { CodeEditorState } from "@/types";
import { Monaco } from "@monaco-editor/react";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      language: "java",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  const savedLanguage = localStorage.getItem("editor-Language") || "java";
  const savedTheme = localStorage.getItem("editor-Theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || "16";

  return {
    language: savedLanguage,
    fontSize: Number(savedFontSize),
    theme: savedTheme,
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    input: "",

    setInput: (input: string) => set({ input }),

    getCode: () => {
      return get().editor?.getValue() || "";
    },

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-Code-${get().language}`);
      if (savedCode) {
        editor.setValue(savedCode);
      }
      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-Theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-Code-${get().language}`, currentCode);
      }
      localStorage.setItem("editor-Language", language);
      set({
        language,
        output: "",
        error: null,
      });
    },

    runCode: async () => {
      const { language, getCode, input } = get();
      const code = getCode();

      if (!code.trim()) {
        set({ error: "⚠️ Please enter some code before running." });
        return;
      }

      set({ isRunning: true, error: null, output: "", executionResult: null });

      const runtime = LANGUAGE_CONFIG[language].pistonRuntime;

      const makeRequest = async () => {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [
              {
                name: "main." + runtime.language,
                content: code,
              },
            ],
            stdin: input || "",
          }),
        });

        if (!response.ok) throw new Error("❌ Piston API server error.");
        return response.json();
      };

      let data;
      let attempts = 0;
      const maxRetries = 2;

      while (attempts < maxRetries) {
        try {
          data = await makeRequest();
          break;
        } catch (e) {
          console.warn(`Retry attempt ${attempts + 1}:`, e);
          attempts++;
          if (attempts === maxRetries) {
            set({
              error: "🚨 Failed to run code after multiple attempts.",
              executionResult: { code, output: "", error: "Retry limit exceeded." },
              isRunning: false,
            });
            return;
          }
        }
      }

      console.log("Piston API Response:", data);

      if (data.message) {
        set({
          error: `⚠️ API Error: ${data.message}`,
          executionResult: { code, output: "", error: data.message },
          isRunning: false,
        });
        return;
      }

      if (data.compile?.code !== undefined && data.compile.code !== 0) {
        const error = data.compile?.stderr || data.compile?.output || "Compilation failed.";
        set({
          error: `\n${error}`,
          executionResult: { code, output: "", error },
        });
        return;
      }
      

      if (data.run?.code !== 0) {
        const error = data.run.stderr || data.run.output || "Runtime error.";
        set({
          error: `\n${error}`,
          executionResult: { code, output: "", error },
          isRunning: false,
        });
        return;
      }

      let output = data.run.output?.trim();
      if (!output) {
        output = "[✅ Code ran successfully but produced no output]";
      }

      // const metadata = `\n\n🧠 Execution Info:\n⏱ Time: ${data.run.time}s\n💾 Memory: ${data.run.memory} KB`;

      set({
        output: output ,
        error: null,
        executionResult: {
          code,
          output: output,
          error: null,
        },
        isRunning: false,
      });
    },
  };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;
