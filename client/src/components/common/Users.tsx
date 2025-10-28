// components/common/Users.tsx
import { useAppContext } from "@/context/AppContext"
//import { useSocket } from "@/context/SocketContext"
//import { useEffect, useState } from "react"
import ParticipantVideo from "./ParticipantVideo"

interface UsersProps {
    localStream: MediaStream | null
    isLocalCameraOn: boolean
    isLocalMicOn: boolean
}

function Users({
    localStream,
    isLocalCameraOn,
    isLocalMicOn,
}: UsersProps) {
    // components/common/Users.tsx

const { users, currentUser: self, remoteStreams } = useAppContext()
    //const { socket } = useSocket()
   // const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
    // --- NEW: Get users and self from context ---
   
    // --- NEW: Calculate count ---
    // If self isn't loaded, count is 0.
    // Otherwise, the count is self (1) + all remote users (users.length).
    
    const activeUserCount = self ? users.length : 0
    // --- END NEW ---
    // --- !! TODO: WebRTC Integration !! ---
   // useEffect(() => {
        // ... (Your WebRTC logic for remote streams goes here) ...
  //  }, [socket])
    // --- End TODO ---

    // --- THIS IS THE FIX ---
    // If 'self' isn't loaded yet, don't try to render anything.
    if (!self) {
        return (
            <div className="flex w-full items-center justify-center p-4">
                <p className="text-xs text-gray-400">Initializing user...</p>
            </div>
        )
    }
    // --- END FIX ---

    // If the code reaches here, 'self' is guaranteed to exist.
     // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
    const remoteUsers = users.filter(user => user.socketId !== self.socketId)

    return (
        <div className="grid grid-cols-2 gap-2">
            {/* 'self' is guaranteed, so we can render it */}
            <ParticipantVideo
                username={self.username + " (You)"}
                stream={localStream}
                isCameraOn={isLocalCameraOn}
                isMicOn={isLocalMicOn}
                isMuted={true}
            />

            {/* Render Remote Users' Videos */}
            {remoteUsers.map(user => (
                <ParticipantVideo
                    key={user.socketId}
                    username={user.username}
                    // --- THIS IS THE KEY ---
                    // It now gets the stream from the global remoteStreams map
                    stream={remoteStreams.get(user.socketId)}
                    // --- END KEY ---
                   
                   isCameraOn={true} // <-- Placeholder
                    isMicOn={true}
                    isMuted={false}
                />
            ))}
        </div>
    )
}

export default Users