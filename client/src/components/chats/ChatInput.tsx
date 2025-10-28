import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import { ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import { FormEvent, useRef , useState, useEffect} from "react"
import { LuSendHorizontal } from 'react-icons/lu';
import { v4 as uuidV4 } from "uuid"
import { BsEmojiSmile } from 'react-icons/bs'; // <-- ADD Emoji Icon
import { IoClose } from 'react-icons/io5'; // <-- ADD Close Icon
import Picker from 'emoji-picker-react';

function ChatInput() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { setMessages, replyingTo, setReplyingTo } = useChatRoom()
    console.log("ChatInput rendering, replyingTo:", replyingTo);
    const inputRef = useRef<HTMLInputElement | null>(null)
    // --- Get new reply state ---
    
    // --- State for emoji picker ---
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const onEmojiClick = (emojiObject: { emoji: string }) => {
        if (inputRef.current) {
            inputRef.current.value += emojiObject.emoji;
            inputRef.current.focus();
        }
    };


    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const inputVal = inputRef.current?.value.trim()

        if (inputVal && inputVal.length > 0) {
            const message: ChatMessage = {
                id: uuidV4(),
                message: inputVal,
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
                // --- ADD THIS ---
                // If we are replying, attach the message snapshot
                replyingTo: replyingTo 
                    ? {
                        id: replyingTo.id,
                        username: replyingTo.username,
                        message: replyingTo.message,
                      } 
                    : undefined,
                // --- END ADD ---
            }
            socket.emit(SocketEvent.SEND_MESSAGE, { message })
            setMessages((messages) => [...messages, message])

            if (inputRef.current) inputRef.current.value = ""
            // --- Clean up ---
            setShowEmojiPicker(false);
            setReplyingTo(null);
        }
    }
    // Close emoji picker if user clicks outside
    // (This is a simple version)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showEmojiPicker) {
                // A bit of a hack to not close when clicking the button
                if ((event.target as Element).closest('.emoji-picker-container') || (event.target as Element).closest('.emoji-toggle-button')) {
                    return;
                }
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showEmojiPicker]);


    return (
        <div className="relative"> {/* Container for emoji picker */}
            {/* --- Emoji Picker --- */}
            {showEmojiPicker && (
                <div className="emoji-picker-container absolute bottom-16">
                    <Picker onEmojiClick={onEmojiClick} />
                </div>
            )}

            {/* --- Reply Preview --- */}
            {replyingTo && (
                <div className="flex items-center justify-between rounded-t-md bg-darkHover p-2">
                    <div className="mr-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        <p className="text-xs font-bold text-primary">
                            Replying to {replyingTo.username}
                        </p>
                        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-300">
                            {replyingTo.message}
                        </p>
                    </div>
                    <button
                        onClick={() => setReplyingTo(null)}
                        className="flex-shrink-0 text-gray-400 hover:text-white"
                        title="Cancel reply"
                    >
                        <IoClose size={20} />
                    </button>
                </div>
            )}

       {/* --- Main Input Form --- */}
            <form
                onSubmit={handleSendMessage}
                className={`flex justify-between border border-primary ${
                    replyingTo ? "rounded-b-md" : "rounded-md" // Adjust rounding
                }`}
            >
                {/* --- Emoji Toggle Button --- */}
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="emoji-toggle-button flex items-center justify-center p-2 text-gray-400 hover:text-white"
                    title="Toggle emojis"
                >
                    <BsEmojiSmile size={20} />
                </button>
                
                <input
                    type="text"
                    className="w-full flex-grow border-none bg-dark p-2 text-white outline-none"
                    placeholder="Enter a message..."
                    ref={inputRef}
                />
                <button
                    className="flex items-center justify-center rounded-r-md bg-primary p-2 text-black"
                    type="submit"
                >
                    <LuSendHorizontal size={24} />
                </button>
            </form>
        </div>
    )
}

export default ChatInput
