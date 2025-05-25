"use client"
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { Code2 } from "lucide-react";

function InputPanel() {
  const input = useCodeEditorStore((state) => state.input);
const setInput = useCodeEditorStore((state) => state.setInput);


  return (
    <div className="relative bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 h-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
            <Code2 className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-sm font-medium text-gray-300">Input</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter any custom input here..."
          className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
          rounded-xl p-4 h-[200px] w-full overflow-auto font-mono text-sm text-gray-200
          placeholder:text-gray-500 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}

export default InputPanel;
