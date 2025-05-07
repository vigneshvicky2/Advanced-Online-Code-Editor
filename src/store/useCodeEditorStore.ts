import { create } from "zustand";
// import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
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
      const { language, getCode, input } = get(); // ✅ include input

      const code = getCode();
      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }
    
      set({ isRunning: true, error: null, output: "" });
    
      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [
              {
                name: "main." + runtime.language,
                content: code,
              },
            ],
            stdin: input,
          }),
        });
    
        const data = await response.json();
        console.log(data);
    
        if (data.message) {
          set({ error: data.message, executionResult: { code, output: "", error: data.message } });
          return;
        }
    
        if (data.compile && data.compile.code !== 0) {
          const error = data.compile.stderr || data.compile.output;
          set({ error, executionResult: { code, output: "", error } });
          return;
        }
    
        if (data.run && data.run.code !== 0) {
          const error = data.run.stderr || data.run.output;
          set({ error, executionResult: { code, output: "", error } });
          return;
        }
    
        const output = data.run.output;
        set({
          output: output.trim(),
          error: null,
          executionResult: { code, output: output.trim(), error: null },
        });
      } catch (error) {
        console.error(error);
        set({
          error: "Error running code",
          executionResult: { code, output: "", error: "Error running code" },
        });
      } finally {
        set({ isRunning: false });
      }
    },
    
  };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;