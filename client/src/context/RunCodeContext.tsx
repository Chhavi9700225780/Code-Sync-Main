import axiosInstance from "@/api/pistonApi"
import { Language, RunContext as RunContextType } from "@/types/run"
import langMap from "lang-map"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"

const RunCodeContext = createContext<RunContextType | null>(null)

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error(
            "useRunCode must be used within a RunCodeContextProvider",
        )
    }
    return context
}

const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
    const { activeFile } = useFileSystem()
    const [input, setInput] = useState<string>("")
   
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([])
    const [selectedLanguage, setSelectedLanguage] = useState<Language>({
        language: "",
        version: "",
        aliases: [],
    })
    const [output, setOutput] = useState<string>("") // Will now hold ONLY stdout
    const [stderr, setStderr] = useState<string>("") // New state for errors
    // --- END CHANGE #1 ---

    useEffect(() => {
        const fetchSupportedLanguages = async () => {
            try {
                const languages = await axiosInstance.get("/runtimes")
                setSupportedLanguages(languages.data)
            } catch (error: any) {
                toast.error("Failed to fetch supported languages")
                if (error?.response?.data) console.error(error?.response?.data)
            }
        }

        fetchSupportedLanguages()
    }, [])

    // Set the selected language based on the file extension
    useEffect(() => {
        if (supportedLanguages.length === 0 || !activeFile?.name) return

        const extension = activeFile.name.split(".").pop()
        if (extension) {
            const languageName = langMap.languages(extension)
            const language = supportedLanguages.find(
                (lang) =>
                    lang.aliases.includes(extension) ||
                    languageName.includes(lang.language.toLowerCase()),
            )
            if (language) setSelectedLanguage(language)
        } else setSelectedLanguage({ language: "", version: "", aliases: [] })
    }, [activeFile?.name, supportedLanguages])

   const runCode = async () => {
    try {
        // --- 1. Initial Checks ---
        if (!selectedLanguage?.language) {
            return toast.error("Please select a language to run the code");
        }
        if (!activeFile || typeof activeFile.content !== 'string') {
            return toast.error("Please open a file with content to run the code");
        }

        // --- 2. Basic Input Check (Keep this) ---
        const requiresInputRegex = /\b(cin\s*>>|scanf\s*\()/;
        const needsInputLikely = requiresInputRegex.test(activeFile.content);
        const runAnyway = false; // Flag to control if execution proceeds after warning
       // Inside runCode, after the API call response:
 // <--- Replace with the REAL keyword from Piston's stderr
        if (needsInputLikely && !input.trim()) {
            // Show a more informative toast, maybe give option to run anyway?
            // For now, let's just warn and stop.
            toast.error("Code seems to need input, but the input box is empty.", { duration: 4000 });
            return; // Stop execution
            // If you want to allow running anyway:
            // toast.error("Input might be required (box empty). Running anyway...", { duration: 4000 });
            // runAnyway = true; // Set flag to continue below
        }

        // --- 3. Prepare for API Call ---
        if (!runAnyway) { // Show loading only if not running after warning
             toast.loading("Running code...");
        }
        setIsRunning(true);
        setOutput("");
        setStderr("");

        const { language, version } = selectedLanguage;

        // --- 4. Call Piston API ---
        const response = await axiosInstance.post("/execute", {
            language,
            version,
            files: [{ name: activeFile.name, content: activeFile.content }],
            stdin: input,
        });

        // --- 5. Process the Response Correctly ---
        const runResult = response.data.run;
        setOutput(runResult.stdout || "");
        setStderr(runResult.stderr || "");

        // --- 6. Cleanup and Final Toasts ---
        setIsRunning(false);
        toast.dismiss();

       // --- SIMPLIFIED SUCCESS/ERROR/TIMEOUT HANDLING ---
        const actualTimeoutKeyword = "signal: killed"; // Use the keyword you found previously, or a generic term like "timeout" if unsure

        if (runResult.stderr && runResult.stderr.toLowerCase().includes(actualTimeoutKeyword.toLowerCase())) {
             // Handle potential timeouts
             setStderr(`Execution may have timed out.\nDid you provide enough input for all 'cin'/'scanf' calls, or is there an infinite loop?\n\nOriginal Error:\n${runResult.stderr}`);
             toast.error("Execution timed out or stopped. Check Error tab.", { duration: 4000 });
        } else if (runResult.stderr) {
            // Handle regular errors
            toast.error("Execution finished with an error. Check Error tab.");
        } else {
            // Handle success (even if input might have been insufficient)
            toast.success("Execution finished successfully.");
        }
         // --- END HANDLING ---

    } catch (error: any) {
        // --- 7. Handle API Errors ---
        console.error("API Error:", error.response?.data);
        setIsRunning(false);
        toast.dismiss();
        toast.error("Failed to run the code (API Error)");
        setStderr(error.response?.data?.message || "An API error occurred.");
    }
};
    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                // --- CHANGE #5: Expose the new states ---
                
                stderr, // Expose stderr
                // --- END CHANGE #5 ---
                isRunning,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode,
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext
