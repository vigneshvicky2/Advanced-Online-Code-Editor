import EditorPanel from "./_components/EditorPanel";
import OutputPanel from "./_components/OutputPanel";
import Header from "./_components/Header";
import InputPanel from "./_components/InputPanel";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-auto hide-scrollbar">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Side: Editor */}
          <div className="min-h-[400px]">
            <EditorPanel />
          </div>

          {/* Right Side: Output + Input stacked vertically */}
          <div className="flex flex-col gap-4">
            <OutputPanel />
            <InputPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
