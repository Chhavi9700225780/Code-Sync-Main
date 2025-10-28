// components/common/ParticipantVideo.tsx
import { useRef, useEffect,useState } from "react"
import { BsCameraVideoOff, BsMicMute } from "react-icons/bs"

interface ParticipantVideoProps {
    username: string
    stream: MediaStream | null | undefined // Stream can be null (loading) or undefined (no stream)
    isCameraOn: boolean
    isMicOn?: boolean // Optional, for showing mute icon
    isMuted: boolean // This is for the <video> tag (e.g., mute yourself)
}
// --- Constants for audio detection ---
const AUDIO_THRESHOLD = 20; // Adjust this value based on testing (0-255)
const AUDIO_CHECK_INTERVAL = 100; // Check volume every 100ms

function ParticipantVideo({
    stream,
    isCameraOn,
    isMicOn,
    username,
    isMuted,
}: ParticipantVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    // --- NEW: State to track speaking status ---
    const [isSpeaking, setIsSpeaking] = useState(false);
    // Refs to store audio analysis objects - avoids re-creation on re-renders
console.log(
        `[ParticipantVideo: ${username}]`,
        { isCameraOn, stream: !!stream }
    )
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null); // For setInterval cleanup
    // --- END LOGGING ---
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    
    // --- NEW: Audio Analysis Setup ---
        const audioTracks = stream?.getAudioTracks();
        if (audioTracks && audioTracks.length > 0 && !audioContextRef.current) {
            // Only set up if we have an audio track and haven't already
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256; // Smaller FFT size for faster analysis

                dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

                sourceRef.current = audioContextRef.current.createMediaStreamSource(
                    new MediaStream([audioTracks[0]]) // Create stream source from the first audio track
                );
                sourceRef.current.connect(analyserRef.current);

                // Start checking volume periodically
                intervalIdRef.current = setInterval(() => {
                    if (!analyserRef.current || !dataArrayRef.current) return;
                    // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
                    analyserRef.current.getByteFrequencyData(dataArrayRef.current); // Use frequency data

                    // Calculate average volume
                    let sum = 0;
                    for (let i = 0; i < dataArrayRef.current.length; i++) {
                        sum += dataArrayRef.current[i];
                    }
                    const average = sum / dataArrayRef.current.length;

                    // Update speaking state based on threshold
                    setIsSpeaking(average > AUDIO_THRESHOLD);

                }, AUDIO_CHECK_INTERVAL);

            } catch (error) {
                console.error("Error setting up audio analysis for", username, error);
                // Clean up on error
                 if (intervalIdRef.current) clearInterval(intervalIdRef.current);
                 sourceRef.current?.disconnect();
                 audioContextRef.current?.close().catch(console.error);
                 audioContextRef.current = null;
                 analyserRef.current = null;
                 sourceRef.current = null;
                 dataArrayRef.current = null;
                 setIsSpeaking(false);
            }

        } else if (!audioTracks || audioTracks.length === 0) {
             // If audio track is removed or doesn't exist, ensure speaking state is false
             setIsSpeaking(false);
        }
        // Cleanup function when component unmounts or stream changes
        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
             // Disconnect and close audio context if it exists
             if (sourceRef.current) {
                 sourceRef.current.disconnect();
                 sourceRef.current = null;
             }
             if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                 audioContextRef.current.close().catch(console.error); // Close context
                 audioContextRef.current = null;
             }
             analyserRef.current = null;
             dataArrayRef.current = null;
             setIsSpeaking(false); // Reset speaking state on cleanup
        };
        // --- END NEW ---

    }, [stream, username]); // Rerun effect if stream or username changes

    return (
        <div className={`relative aspect-video w-full overflow-hidden rounded-md border bg-gray-900 transition-all duration-200
                ${isSpeaking && isMicOn !== false ? // Only show if mic isn't explicitly muted
                    'border-primary shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-darkHover' :
                    'border-gray-700'
                }`}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className={`h-full w-full object-cover ${
                    isCameraOn && stream ? "block" : "hidden"
                }`}
            />
            {/* Show placeholder if camera is off or stream not available */}
            {(!isCameraOn || !stream) && (
                <div className="flex h-full w-full items-center justify-center">
                    {/* You could show an avatar here instead */}
                    <BsCameraVideoOff size={30} className="text-gray-600" />
                </div>
            )}

            {/* Username */}
            <div className="absolute bottom-1 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                {username}
            </div>

            {/* Mute Icon */}
            {isMicOn === false && ( // Show only if explicitly false
                <div className="absolute bottom-1 right-2 rounded-full bg-black/50 p-1 text-xs text-white">
                    <BsMicMute size={14} />
                </div>
            )}
        </div>
    )
}

export default ParticipantVideo