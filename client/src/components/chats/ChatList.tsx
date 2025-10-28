import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { SyntheticEvent, useEffect, useRef } from "react"
import { Reply } from 'lucide-react';
 // <-- ADD Reply Icon
function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
        // --- Get new reply state setter ---
        setReplyingTo,
    } = useChatRoom()
    const { currentUser } = useAppContext()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement
        setLastScrollHeight(container.scrollTop)
    }

    // Scroll to bottom when messages change
    useEffect(() => {
        if (!messagesContainerRef.current) return
        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false)
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight
    }, [isNewMessage, setIsNewMessage, lastScrollHeight])

    return (
       <div
    className="flex flex-col flex-grow overflow-auto rounded-md bg-darkHover p-2" // <-- Add "flex flex-col"
    ref={messagesContainerRef}
    onScroll={handleScroll}
>
            {/* Chat messages */}
            {messages.map((message) => {
                const isMyMessage = message.username === currentUser?.username;
                return (
                    <div
                        key={message.id}
                        // --- UPDATED Styling for alignment ---
                        className={`group relative mb-2 w-[80%] max-w-lg break-words rounded-md bg-dark px-3 py-2 ${
                            isMyMessage
                                ? "self-end" // Aligns to right
                                : "self-start" // Aligns to left
                        }`}
                    >
                        {/* --- ADD: Reply Button (shows on hover) --- */}
                        <button 
                           onClick={() => {
        console.log("Reply button clicked for message:", message.id);
        setReplyingTo(message);
    }}
    className={`absolute top-1/2 -translate-y-1/2 p-1 text-white  ${
        isMyMessage ? "left-64" : "-right-6"
    }`}
    title="Reply"
>
    {/* Removed the <h1>Reply</h1> */}
    
    <Reply className="text-white" size={14} />
                        </button>

                        {/* --- ADD: Render Quoted Reply --- */}
                        {message.replyingTo && (
                            <div className="mb-2 rounded border-l-2 border-primary bg-darkHover p-2">
                                <p className="text-xs font-bold text-primary">
                                    {message.replyingTo.username}
                                </p>
                                <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-300">
                                    {message.replyingTo.message}
                                </p>
                            </div>
                        )}

                        {/* --- Existing Message Content --- */}
                        <div className="flex justify-between">
                            <span className="text-xs font-bold text-primary">
                                {message.username}
                            </span>
                            <span className="text-xs text-white">
                                {message.timestamp}
                            </span>
                        </div>
                        <p className="py-1">{message.message}</p>
                    </div>
                        
                )
            })}
        </div>
    )
}

export default ChatList
