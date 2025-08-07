/* eslint-disable @typescript-eslint/no-explicit-any */
// store/useCodeEditorStore.ts

import { create } from "zustand";
import { CodeEditorState } from "@/types";
import { Monaco } from "@monaco-editor/react";

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

    getCode: () => get().editor?.getValue() || "",

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
    
      try {
        const response = await fetch("/api/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_code: code,
            language,
            input: input || "",
          }),
        });
    
        if (!response.ok) {
          throw new Error("❌ Server returned an error response.");
        }
    
        const data = await response.json();
    
        let output = "";
        let errorMessage = "";
    
        if (data.build_stderr) {
          errorMessage = data.build_stderr;
        } else if (data.stderr) {
          errorMessage = data.stderr;
        } else if (data.output) {
          output = data.output;
        } else {
          output = "[✅ Code ran successfully but produced no output]";
        }
    
        set({
          output: errorMessage || output,
          error: errorMessage || null,
          executionResult: {
            code,
            output: errorMessage || output,
            error: errorMessage || null,
          },
          isRunning: false,
        });
      } catch (error: any) {
        console.error("Execution Error:", error);
        set({
          output: "Error occurred during code execution.",
          error: error.message || "Execution failed.",
          isRunning: false,
        });
      }
    },
  };
});

// Optional: quick access to result
export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;
