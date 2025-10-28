// UsersView.tsx (with debugging logs)
import Users from "@/components/common/Users"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { GoSignOut } from "react-icons/go"
import { IoShareOutline } from "react-icons/io5"
import { LuCopy } from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useState } from "react"
import {
    BsMic,
    BsMicMute,
    BsCameraVideo,
    BsCameraVideoOff,
} from "react-icons/bs"

function UsersView() {
    const navigate = useNavigate()
    const { viewHeight } = useResponsive()
    
    const { socket } = useSocket()
    const {
        setStatus,
        users,
        currentUser: self,
        localStream, // Get localStream from context
        setLocalStream, // Get setLocalStream from context
    } = useAppContext()
    const [isMicOn, setIsMicOn] = useState(false)
    const [isCameraOn, setIsCameraOn] = useState(false)
   // const localStreamRef = useRef<MediaStream | null>(null)
//const { users, currentUser: self } = useAppContext()

    // --- NEW: Calculate count ---
    // If self isn't loaded, count is 0.
    // Otherwise, the count is self (1) + all remote users (users.length).
   
    const copyURL = async () => {
        // ... (copyURL logic remains the same)
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success("URL copied to clipboard")
        } catch (error) {
            toast.error("Unable to copy URL to clipboard")
            console.log(error)
        }
    }

    const shareURL = async () => {
        // ... (shareURL logic remains the same)
        const url = window.location.href
        try {
            await navigator.share({ url })
        } catch (error) {
            toast.error("Unable to share URL")
            console.log(error)
        }
    }

    const startMedia = async () => {
        console.log("Attempting to start media (getUserMedia)...")
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            })
           // --- MAIN CHANGE HERE ---
            // localStreamRef.current = stream // <-- REMOVE THIS
            setLocalStream(stream) // <-- ADD THIS: Save stream to global context
            // --- END CHANGE ---
            stream.getAudioTracks()[0].enabled = false
            stream.getVideoTracks()[0].enabled = false

            // --- !! TODO: WebRTC Integration !! ---
            // ...
            // --- End TODO ---

            console.log("Media stream obtained and ready.")
            return true
        } catch (err) {
            console.error("--- ERROR in startMedia() ---", err)
            toast.error("Could not access camera/mic. Please check permissions.")
            return false
        }
    }

    const handleMicToggle = async () => {
        console.log("Mic toggle clicked. Current state:", isMicOn)
        if (!localStream) {
            console.log("No local stream found, calling startMedia...")
            const success = await startMedia()
            if (!success) {
                console.error("startMedia() failed or was denied.")
                return
            }
            console.log("startMedia() succeeded.")
        }

        const newMicState = !isMicOn
        console.log("Toggling mic state to:", newMicState)

        localStream?.getAudioTracks().forEach(track => {
            track.enabled = newMicState
        })

        setIsMicOn(newMicState)
        
        // TODO: socket.emit('user:toggle-mic', newMicState);
    }

    const handleCameraToggle = async () => {
        console.log("Camera toggle clicked. Current state:", isCameraOn)
       if (!localStream) {
            console.log("No local stream found, calling startMedia...")
            const success = await startMedia()
            if (!success) {
                console.error("startMedia() failed or was denied.")
                return
            }
            console.log("startMedia() succeeded.")
        }

        const newCamState = !isCameraOn
        console.log("Toggling camera state to:", newCamState)
        
      localStream?.getVideoTracks().forEach(track => {
            track.enabled = newCamState
        })
        
        setIsCameraOn(newCamState)

        // TODO: socket.emit('user:toggle-cam', newCamState);
    }

    const leaveRoom = () => {
        console.log("Leaving room, stopping all media tracks.");
        if (localStream) { // <-- TO THIS
            // localStreamRef.current.getTracks().forEach(track => track.stop()) // <-- CHANGE THIS
            localStream.getTracks().forEach(track => track.stop()) // <-- TO THIS
            // localStreamRef.current = null // <-- REMOVE THIS
            setLocalStream(null) // <-- ADD THIS
        }

        socket.disconnect()
        setStatus(USER_STATUS.DISCONNECTED)
        navigate("/", {
            replace: true,
        })
    }
const activeUserCount = self ? users.length + 1 : 0
// --- NEW: Listen for Tab Visibility ---
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log("Tab hidden - media might be paused by browser");
                // Optional: You could potentially disable tracks here, but browsers often do it anyway
                // localStream?.getTracks().forEach(track => track.enabled = false);
            } else {
                console.log("Tab visible - checking/re-enabling media tracks");
                // Ensure tracks are enabled if they exist
                if (localStream) {
                    localStream.getAudioTracks().forEach(track => {
                        // Re-enable based on your component's state (isMicOn)
                        track.enabled = isMicOn;
                    });
                    localStream.getVideoTracks().forEach(track => {
                        // Re-enable based on your component's state (isCameraOn)
                        track.enabled = isCameraOn;
                    });
                    console.log("Local tracks re-enabled based on state.");

                    // --- OPTION B: Force Renegotiation (More Robust) ---
                    // Tell SocketContext to renegotiate with peers
                    // You would need to add a 'renegotiate' event handler in SocketContext
                    // that iterates through peerConnections and potentially sends new offers.
                    // socket.emit("webrtc-renegotiate-needed");
                    // console.log("Emitted renegotiation request.");
                    // --- End Option B ---
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
        // Add dependencies that control track enabling (isMicOn, isCameraOn)
    }, [localStream, isMicOn, isCameraOn, socket]); // Include socket if using Option B
    // --- END NEW ---
    return (
        <div className="flex flex-col p-4" style={{ height: viewHeight }}>
           <h1 className="view-title mb-4">
                {/* Only show the count if it's greater than 0 (i.e., loaded) */}
                Users {activeUserCount > 0 && `(${activeUserCount})`}
            </h1>
            <div className="flex-1 overflow-y-auto">
                <Users
                    localStream={localStream}
                    isLocalCameraOn={isCameraOn}
                    isLocalMicOn={isMicOn}
                    // TODO: You'll also need to pass isLocalMicOn={isMicOn}
                />
            </div>

            <div className="mt-auto flex flex-col items-center gap-4 pt-4">
                <div className="flex w-full gap-4">
                    <button
                        onClick={handleMicToggle}
                        className={`flex flex-grow items-center justify-center rounded-md p-3 text-white transition-all ${
                            isMicOn
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-red-600 hover:bg-red-500"
                        }`}
                        title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                    >
                       {/* --- CORRECT --- */}
{isMicOn ? (
    <BsMic size={22} />           // "On" icon
) : (
    <BsMicMute size={22} />     // "Off" icon
)}
                    </button>
                    <button
                        onClick={handleCameraToggle}
                        className={`flex flex-grow items-center justify-center rounded-md p-3 text-white transition-all ${
                            isCameraOn
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-red-600 hover:bg-red-500"
                        }`}
                        title={isCameraOn ? "Stop camera" : "Start camera"}
                    >
                        {isCameraOn ? (
    <BsCameraVideo size={22} />     // "On" icon in the "On" state
) : (
    <BsCameraVideoOff size={22} /> // "Off" icon in the "Off" state
)}
                    </button>
                </div>

                <div className="flex w-full gap-4">
                    <button
                        className="flex flex-grow items-center justify-center rounded-md bg-white p-3 text-black"
                        onClick={shareURL}
                        title="Share Link"
                    >
                        <IoShareOutline size={26} />
                    </button>
                    <button
                        className="flex flex-grow items-center justify-center rounded-md bg-white p-3 text-black"
                        onClick={copyURL}
                        title="Copy Link"
                    >
                        <LuCopy size={22} />
                    </button>
                    <button
                        className="flex flex-grow items-center justify-center rounded-md bg-primary p-3 text-black"
                        onClick={leaveRoom}
                        title="Leave room"
                    >
                        <GoSignOut size={22} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UsersView