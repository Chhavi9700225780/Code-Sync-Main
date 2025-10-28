import { useRunCode } from "@/context/RunCodeContext"
import useResponsive from "@/hooks/useResponsive"
import { ChangeEvent, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { LuCopy } from "react-icons/lu"
import { PiCaretDownBold } from "react-icons/pi"

function RunView() {
    const { viewHeight } = useResponsive()
    const {
        setInput,
        output,
        stderr,
        isRunning,
        supportedLanguages,
        selectedLanguage,
        setSelectedLanguage,
        runCode,
    } = useRunCode()
// --- NEW: State to manage which tab is active ---
    const [activeTab, setActiveTab] = useState<"input" | "output" | "error">(
        "input",
    )
    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const lang = JSON.parse(e.target.value)
        setSelectedLanguage(lang)
    }

  const copyToClipboard = (text: string, type: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.success(`${type} copied to clipboard`)
    }
    // --- NEW: Automatically switch tabs after code runs ---
    useEffect(() => {
        if (isRunning) return // Don't switch while it's running

        if (stderr) {
            setActiveTab("error")
        } else if (output) {
            setActiveTab("output")
        }
    }, [isRunning, output, stderr])

    return (
        <div
            className="flex flex-col items-center gap-2 p-4"
            style={{ height: viewHeight }}
        >
            <h1 className="view-title">Run Code</h1>
            <div className="flex h-[90%] w-full flex-col items-end gap-2 md:h-[92%]">
                <div className="relative w-full">
                    <select
                        className="w-full rounded-md border-none bg-darkHover px-4 py-2 text-white outline-none"
                        value={JSON.stringify(selectedLanguage)}
                        onChange={handleLanguageChange}
                    >
                        {supportedLanguages
                            .sort((a, b) => (a.language > b.language ? 1 : -1))
                            .map((lang, i) => {
                                return (
                                    <option
                                        key={i}
                                        value={JSON.stringify(lang)}
                                    >
                                        {lang.language +
                                            (lang.version
                                                ? ` (${lang.version})`
                                                : "")}
                                    </option>
                                )
                            })}
                    </select>
                    <PiCaretDownBold
                        size={16}
                        className="absolute bottom-3 right-4 z-10 text-white"
                    />
                </div>

                
               <button
                className="flex w-full justify-center rounded-md bg-primary p-2 font-bold text-black outline-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={runCode}
                disabled={isRunning}
             >
                {isRunning ? "Running..." : "Run"}
             </button>
                
                

                <div className="flex h-full min-h-0 w-full flex-col rounded-md bg-darkHover">
                {/* Tab Buttons */}
                <div className="flex w-full flex-shrink-0 border-b border-gray-700">
                    <TabButton
                        title="Input"
                        isActive={activeTab === "input"}
                        onClick={() => setActiveTab("input")}
                    />
                    <TabButton
                        title="Output"
                        isActive={activeTab === "output"}
                        onClick={() => setActiveTab("output")}
                    />
                    <TabButton
                        title="Error"
                        isActive={activeTab === "error"}
                        hasContent={!!stderr} // Add a visual indicator if there's an error
                        onClick={() => setActiveTab("error")}
                    />
                </div>

                {/* Tab Content */}
                <div className="relative h-full w-full p-2">
                    {activeTab === "input" && (
                        <textarea
                            className="h-full w-full resize-none border-none bg-transparent text-white outline-none"
                            placeholder="Write your input here..."
                            onChange={e => setInput(e.target.value)}
                        />
                    )}
                    {activeTab === "output" && (
                        <OutputPanel
                            text={output}
                            onCopy={() => copyToClipboard(output, "Output")}
                        />
                    )}
                    {activeTab === "error" && (
                        <OutputPanel
                            text={stderr}
                            textColor="text-red-400" // Make errors red
                            onCopy={() => copyToClipboard(stderr, "Error")}
                        />
                    )}
                </div>
            </div>

            
            </div>
           
        </div>
    )
}
// --- NEW: Helper components for a cleaner layout ---

// A reusable button for the tabs
const TabButton = ({
    title,
    isActive,
    onClick,
    hasContent = false,
}: {
    title: string
    isActive: boolean
    onClick: () => void
    hasContent?: boolean
}) => (
    <button
        onClick={onClick}
        className={`relative px-4 py-2 text-sm font-medium transition-colors ${
            isActive
                ? "bg-gray-700/50 text-white"
                : "text-gray-400 hover:bg-gray-800/50"
        }`}
    >
        {title}
        {hasContent && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        )}
    </button>
)

// A reusable panel for displaying text (used for both output and error)
const OutputPanel = ({
    text,
    onCopy,
    textColor = "text-white",
}: {
    text: string
    onCopy: () => void
    textColor?: string
}) => (
    <div className="flex h-full w-full flex-col">
        <div className="flex w-full justify-end">
            <button onClick={onCopy} title="Copy">
                <LuCopy size={16} className="cursor-pointer text-gray-400 hover:text-white" />
            </button>
        </div>
        <div className="w-full flex-grow overflow-y-auto pt-2">
            {text ? (
                <pre className={`text-wrap text-sm ${textColor}`}>{text}</pre>
            ) : (
                <p className="text-sm text-gray-500">No output.</p>
            )}
        </div>
    </div>
)

export default RunView
