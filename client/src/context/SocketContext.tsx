import { DrawingData } from "@/types/app"
import {
    SocketContext as SocketContextType,
    SocketEvent,
    SocketId,
} from "@/types/socket"
import { RemoteUser, USER_STATUS, User } from "@/types/user"
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react"
import { toast } from "react-hot-toast"
import { Socket, io } from "socket.io-client"
import { useAppContext } from "./AppContext"

const SocketContext = createContext<SocketContextType | null>(null)

export const useSocket = (): SocketContextType => {
  
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://api-alb-2025293782.us-east-1.elb.amazonaws.com"
//const SOCKET_URL = "http://localhost:3000"; // <-- Connect via host mapping

  const WebRTCSocketEvent = {
    WEBRTC_OFFER: "webrtc-offer",
    WEBRTC_ANSWER: "webrtc-answer",
    WEBRTC_ICE_CANDIDATE: "webrtc-ice-candidate",
}
const STUN_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
}
const SocketProvider = ({ children }: { children: ReactNode }) => {
    const {
        users,
        setUsers,
        setStatus,
        setCurrentUser,
        drawingData,
        setDrawingData,
        localStream,
        setRemoteStreams,
        currentUser,
    } = useAppContext()
    /*const socket: Socket = useMemo(
        () =>
            io(BACKEND_URL, {
                reconnectionAttempts: 2,
            }),
        [],
    )*/
    
    const socket: Socket = useMemo(
        () =>
            io(BACKEND_URL  , {
                reconnectionAttempts: 2,
            }),
        [],
    )
const peerConnections = useRef<Map<SocketId, RTCPeerConnection>>(new Map())
    const handleError = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any) => {
            console.log("socket error", err)
            setStatus(USER_STATUS.CONNECTION_FAILED)
            toast.dismiss()
            toast.error("Failed to connect to the server")
        },
        [setStatus],
    )

    const handleUsernameExist = useCallback(() => {
        toast.dismiss()
        setStatus(USER_STATUS.INITIAL)
        toast.error(
            "The username you chose already exists in the room. Please choose a different username.",
        )
    }, [setStatus])

    const handleJoiningAccept = useCallback(
        ({ user, users }: { user: User; users: RemoteUser[] }) => {
            setCurrentUser(user)
            setUsers(users)
            toast.dismiss()
            setStatus(USER_STATUS.JOINED)

            if (users.length > 1) {
                toast.loading("Syncing data, please wait...")
            }
        },
        [setCurrentUser, setStatus, setUsers],
    )
    const closePeerConnection = useCallback((socketId: SocketId) => {
        console.log(`[WebRTC] Closing and removing PeerConnection for ${socketId}`)
        peerConnections.current.get(socketId)?.close()
        peerConnections.current.delete(socketId)
        setRemoteStreams(prev => {
            const newStreams = new Map(prev)
            newStreams.delete(socketId)
            return newStreams
        })
    }, [setRemoteStreams])

    const createPeerConnection = useCallback((socketId: SocketId, isOfferor: boolean) => {
        console.log(`[WebRTC] Creating PeerConnection for ${socketId}. Offeror: ${isOfferor}. localStream: ${!!localStream}, Tracks: ${localStream?.getTracks().length}`); // <-- LOG 2
       // Prevent duplicate connections
        if (peerConnections.current.has(socketId)) {
            console.warn(`[WebRTC] PeerConnection already exists for ${socketId}.`);
            return peerConnections.current.get(socketId) as RTCPeerConnection;
        }

        const pc = new RTCPeerConnection(STUN_SERVERS)
        peerConnections.current.set(socketId, pc)

        if (localStream) {
            localStream.getTracks().forEach(track => {
                console.log(`[WebRTC] Adding ${track.kind} track to PC for ${socketId}`); // <-- LOG 3
                try {
                    pc.addTrack(track, localStream)
                } catch (error) {
                    console.error(`[WebRTC] Error adding track for ${socketId}:`, error);
                }
            })
        } else {
            console.warn(`[WebRTC] Cannot add tracks for ${socketId}: localStream is null.`); // <-- LOG 4
        }

        // When the OTHER user sends their video, add it to remoteStreams
        pc.ontrack = event => {
            console.log(`>>> ONTRACK event received from socketId: ${socketId}`, event.streams[0]); // Make sure this log exists
            setRemoteStreams(prev =>
                new Map(prev).set(socketId, event.streams[0]),
            )
        }

        // Handle network negotiation
        pc.onicecandidate = event => {
            if (event.candidate) {
                console.log(`[WebRTC] ---> Sending ICE CANDIDATE to ${socketId}`); // <-- LOG 6
                socket.emit(WebRTCSocketEvent.WEBRTC_ICE_CANDIDATE, {
                    to: socketId,
                    candidate: event.candidate,
                })
            }
        }
        // Handle connection state changes (for debugging)
        pc.oniceconnectionstatechange = () => {
             console.log(`[WebRTC] ICE Connection State Change for ${socketId}: ${pc.iceConnectionState}`); // <-- LOG 7
        };
        pc.onconnectionstatechange = () => {
             console.log(`[WebRTC] Connection State Change for ${socketId}: ${pc.connectionState}`); // <-- LOG 8
        }
        // If you are the "offeror" (the one starting the call), create an offer
        if (isOfferor) {
            console.log(`[WebRTC] Creating OFFER for ${socketId}`); // <-- LOG 9
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    console.log(`[WebRTC] ---> Sending OFFER to ${socketId}`); // <-- LOG 10
                    socket.emit(WebRTCSocketEvent.WEBRTC_OFFER, {
                        to: socketId,
                        offer: pc.localDescription,
                    })
                })
                .catch(error => console.error(`[WebRTC] Error creating offer for ${socketId}:`, error));
        }

        return pc
    }, [localStream, setRemoteStreams, socket])


   const handleOffer = useCallback(async ({ from, offer }: { from: SocketId; offer: RTCSessionDescriptionInit }) => {
        console.log(`[WebRTC] <<< Received OFFER from ${from}`); // <-- LOG 11
        const pc = createPeerConnection(from, false) // false = not offeror
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            console.log(`[WebRTC] Set remote description (offer) from ${from}`); // <-- LOG 12
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log(`[WebRTC] ---> Sending ANSWER to ${from}`); // <-- LOG 13
            socket.emit(WebRTCSocketEvent.WEBRTC_ANSWER, {
                to: from,
                answer: pc.localDescription,
            })
        } catch (error) {
            console.error(`[WebRTC] Error handling offer from ${from}:`, error);
        }
    }, [createPeerConnection, socket])

   const handleAnswer = useCallback(async ({ from, answer }: { from: SocketId; answer: RTCSessionDescriptionInit }) => {
        console.log(`[WebRTC] <<< Received ANSWER from ${from}`); // <-- LOG 14
        const pc = peerConnections.current.get(from)
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log(`[WebRTC] Set remote description (answer) from ${from}`); // <-- LOG 15
            } catch (error) {
                console.error(`[WebRTC] Error handling answer from ${from}:`, error);
            }
        } else {
             console.warn(`[WebRTC] PeerConnection not found for ${from} when handling answer.`);
        }
    }, [])

    const handleIceCandidate = useCallback(async ({ from, candidate }: { from: SocketId; candidate: RTCIceCandidateInit }) => {
        console.log(`[WebRTC] <<< Received CANDIDATE from ${from}`); // <-- LOG 16
        const pc = peerConnections.current.get(from);
        if (pc) {
            try {
                 // Try adding candidate even if remote description isn't set yet, but log errors
                 await pc.addIceCandidate(new RTCIceCandidate(candidate));
                 // console.log(`[WebRTC] Added ICE candidate from ${from}`); // This can be very noisy
            } catch (error) {
                 // Ignore common harmless errors when candidates arrive early
                  // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
                 if (error.name !== 'InvalidStateError' && !error.message.includes("remote description is not set")) {
                    console.error(`[WebRTC] Error adding received ICE candidate from ${from}`, error);
                 }
            }
        } else {
            console.warn(`[WebRTC] PeerConnection not found for ${from} when receiving ICE candidate.`);
        }
    }, []);


    const handleUserLeft = useCallback(
        ({ user }: { user: User }) => {
            toast.success(`${user.username} left the room`)
            setUsers(users.filter((u: User) => u.username !== user.username))
            // --- NEW ---
            // Find the socketId from the username (you might need to adjust this)
            const remoteUser = users.find(u => u.username === user.username)
            if (remoteUser) {
                closePeerConnection(remoteUser.socketId)
            }
            // --- END NEW ---
        },
        [setUsers, users, closePeerConnection],
    )

    const handleRequestDrawing = useCallback(
        ({ socketId }: { socketId: SocketId }) => {
            socket.emit(SocketEvent.SYNC_DRAWING, { socketId, drawingData })
        },
        [drawingData, socket],
    )
useEffect(() => {
    console.log(`[Connect Effect] Running. localStream: ${!!localStream}, currentUser: ${!!currentUser}, Users: ${users.length}`);
    if (!localStream || !currentUser) {
        console.log("[Connect Effect] Exiting: localStream or currentUser not ready.");
        return;
    }

    users.forEach(user => {
        // Ensure not connecting to self
          // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
        if (user.socketId === currentUser.socketId) return;

        // --- NEW: Determine who should offer ---
        // Only create offer if my ID is "lower" than the other user's ID
          // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
        const shouldOffer = currentUser.socketId < user.socketId;
        // --- END NEW ---

        if (!peerConnections.current.has(user.socketId)) {
            console.log(`[Connect Effect] Needs connection for ${user.username} (${user.socketId}). Should Offer: ${shouldOffer}`);
            // --- UPDATED: Pass shouldOffer to createPeerConnection ---
            createPeerConnection(user.socketId, shouldOffer);
        }
        // --- If connection exists, potentially renegotiate if needed (advanced) ---
        // else { console.log(`[Connect Effect] Connection already exists for ${user.username}`) }
    });

    // Cleanup stale connections (unchanged)
    peerConnections.current.forEach((pc, socketId) => {
          // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
        if (!users.some(u => u.socketId === socketId) && socketId !== currentUser.socketId) {
            console.log(`[Connect Effect] Cleaning up stale connection for ${socketId}`);
            closePeerConnection(socketId);
        }
    });

}, [localStream, users, currentUser, createPeerConnection, closePeerConnection]);


    const handleDrawingSync = useCallback(
        ({ drawingData }: { drawingData: DrawingData }) => {
            setDrawingData(drawingData)
        },
        [setDrawingData],
    )

    useEffect(() => {
        socket.on("connect_error", handleError)
        socket.on("connect_failed", handleError)
        socket.on(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
        socket.on(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
        socket.on(SocketEvent.USER_DISCONNECTED, handleUserLeft)
        socket.on(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
        socket.on(SocketEvent.SYNC_DRAWING, handleDrawingSync)
socket.on(WebRTCSocketEvent.WEBRTC_OFFER, handleOffer)
        socket.on(WebRTCSocketEvent.WEBRTC_ANSWER, handleAnswer)
        socket.on(WebRTCSocketEvent.WEBRTC_ICE_CANDIDATE, handleIceCandidate)
        return () => {
            socket.off("connect_error")
            socket.off("connect_failed")
            socket.off(SocketEvent.USERNAME_EXISTS)
            socket.off(SocketEvent.JOIN_ACCEPTED)
            socket.off(SocketEvent.USER_DISCONNECTED)
            socket.off(SocketEvent.REQUEST_DRAWING)
            socket.off(SocketEvent.SYNC_DRAWING)
            socket.off(WebRTCSocketEvent.WEBRTC_OFFER)
            socket.off(WebRTCSocketEvent.WEBRTC_ANSWER)
            socket.off(WebRTCSocketEvent.WEBRTC_ICE_CANDIDATE)

            // --- NEW: Cleanup all peer connections on unmount ---
            console.log("[WebRTC] Cleaning up all peer connections on unmount."); // <-- LOG 21
            peerConnections.current.forEach((pc, socketId) => {
                closePeerConnection(socketId);
            });
            // --- END NEW ---
        }
    }, [
        handleDrawingSync,
        handleError,
        handleJoiningAccept,
        handleRequestDrawing,
        handleUserLeft,
        handleUsernameExist,
        setUsers,
        socket,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        closePeerConnection,
    ])

    return (
        <SocketContext.Provider
            value={{
                socket,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export { SocketProvider }
export default SocketContext
