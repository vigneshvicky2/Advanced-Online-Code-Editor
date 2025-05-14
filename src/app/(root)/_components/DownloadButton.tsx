"use client";
import { getExecutionResult, useCodeEditorStore } from "@/store/useCodeEditorStore";
import { motion } from 'framer-motion';
// import { ruby } from "framer-motion/client";
import { Download} from 'lucide-react';
import React from 'react'

function DownloadButton() {
  const {  language , getCode } = useCodeEditorStore();
  const { input } = useCodeEditorStore();
  const handleDownload = () => {
    const code = getCode();
    const joined_output = getExecutionResult()?.output || '';
    const joined_input = input || '';
    // console.log(input);
    // const joined_error = getExecutionResult()?.error||'';
    const commentBlock_output :  {[key: string]: unknown}= {
      javascript: `/*\n----- Output -----\n${joined_output}\n*/`,
      typescript: `/*\n----- Output -----\n${joined_output}\n*/`,
      python: `"""\n----- Output -----\n ${joined_output}\n"""`,
      java: `/*\n----- Output -----\n${joined_output}\n*/`,
      csharp: `/*\n----- Output -----\n${joined_output}\n*/`,
      php: `/*\n----- Output -----\n${joined_output}\n*/`,
      rust: `/*\n----- Output -----\n${joined_output}\n*/`,
      c: `/*\n----- Output -----\n${joined_output}\n*/`,
      cpp: `/*\n----- Output -----\n${joined_output}\n*/`,
      swift : `/*\n----- Outnput -----\n${joined_output}\n*/`,
      ruby : `=begin\n----- Output -----\n${joined_output}\n=end`,
      
    };
    const commentBlock_Input :  {[key: string]: unknown}= {
      javascript: `/*\n----- Input -----\n${joined_input}\n*/`,
      typescript: `/*\n----- Input -----\n${joined_input}\n*/`,
      python: `"""\n----- Input -----\n ${joined_input}\n"""`,
      java: `/*\n----- Input -----\n${joined_input}\n*/`,
      csharp: `/*\n----- Input -----\n${joined_input}\n*/`,
      php: `/*\n----- Input -----\n${joined_input}\n*/`,
      rust: `/*\n----- Input -----\n${joined_input}\n*/`,
      c: `/*\n----- Input -----\n${joined_input}\n*/`,
      cpp: `/*\n----- Input -----\n${joined_input}\n*/`,
      swift : `/*\n----- Input -----\n${joined_input}\n*/`,
      ruby : `=begin\n----- Input -----\n${joined_input}\n=end`,
    };

    const getJavaClassName = (code: string) => {
      const classNameMatch = code.match(/class\s+(\w+)/);
      return classNameMatch ? classNameMatch[1] : 'HelloWorld';
    };
    // File extension mapping
    const extensionMap :  {[key:string] : unknown} = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      csharp: "cs",
      php: "php",
      rust: "rs",
      c: "c",
      cpp: "cpp",
      ruby:"rb",
      swift:"swift",
    };

    // Prompt the user for filename for non-Java languages
    let fileName = "";
    if (language === "java") {
      fileName = getJavaClassName(code) + ".java";
    } else {
      fileName = prompt("Enter the filename:", "Enter Your Program Name") + `.${extensionMap[language]}`;
      if (fileName === "null" + `.${extensionMap[language]}`) return;
    }
    const inputComment = commentBlock_Input[language];
    // Append the output comment to the code
    const outputComment = commentBlock_output[language];
    // console.log(inputComment);
    // console.log(outputComment);
    // // Blob to download the file
    const blob = new Blob([code + "\n\n" +inputComment + "\n\n" + outputComment], { type: "text/plain;charset=utf-8" });
    console.log(blob.stream);
    // Use the fileName determined above
    const extension = extensionMap[language] || "txt";
    const fileNameWithExtension = fileName || `code-with-output.${extension}`;

    // Create an invisible download link and trigger it
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileNameWithExtension;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  return (
    <motion.button
      onClick={handleDownload}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
      group relative inline-flex items-center gap-2.5 px-5 py-2.5
      disabled:cursor-not-allowed
      focus:outline-none
    `}
    >
      {/* bg wit gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 rounded-xl opacity-100 transition-opacity group-hover:opacity-90" />
      <div className="relative flex items-center gap-2.5">
          <>
            <div className="relative flex items-center justify-center w-4 h-4">
              <Download className="w-4 h-4 text-white/90 transition-transform group-hover:scale-110 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-white/90 group-hover:text-white">
              Download Code
            </span>
          </>
        
      </div>
    </motion.button>
  )
}

export default DownloadButton

