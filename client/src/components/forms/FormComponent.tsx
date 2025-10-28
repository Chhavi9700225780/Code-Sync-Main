// src/components/forms/FormComponent.tsx

import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Users, Hash } from "lucide-react"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()
    const [focusedInput, setFocusedInput] = useState<string | null>(null)
    const [isHovered, setIsHovered] = useState(false)

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }

        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <motion.div
            className="relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-gray-700 bg-darkHover/90 p-6 backdrop-blur-xl sm:w-[500px] sm:p-8"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ boxShadow: "0 20px 60px -15px rgba(34, 197, 94, 0.3)" }}
        >
            {/* Animated Background Glow */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-green-500/10"
                animate={{
                    opacity: isHovered ? 0.8 : 0.3,
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Floating Orbs */}
            <AnimatePresence>
                {isHovered && (
                    <>
                        <motion.div
                            className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.4 }}
                        />
                        <motion.div
                            className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-green-500/20 blur-2xl"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Title with Icon */}
                <motion.div
                    className="mb-2 flex items-center gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-semibold text-white">
                        Join or Create a Room
                    </h2>
                </motion.div>

                <motion.p
                    className="mb-6 text-center text-sm text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Enter a Room ID to join or generate a new one.
                </motion.p>

                {/* Form */}
                <form onSubmit={joinRoom} className="w-full space-y-4">
                    {/* Room ID Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative"
                    >
                        <motion.div
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            animate={{
                                scale: focusedInput === "roomId" ? 1.1 : 1,
                                color:
                                    focusedInput === "roomId"
                                        ? "rgb(34, 197, 94)"
                                        : "rgb(156, 163, 175)",
                            }}
                        >
                            <Hash className="h-5 w-5" />
                        </motion.div>
                        <input
                            type="text"
                            name="roomId"
                            placeholder="Room Id"
                            className="w-full rounded-lg border border-gray-600 bg-darkHover/50 py-3 pl-11 pr-3 text-white transition-all duration-300 placeholder:text-gray-500 focus:border-primary focus:bg-darkHover focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onChange={handleInputChanges}
                            value={currentUser.roomId}
                            onFocus={() => setFocusedInput("roomId")}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <AnimatePresence>
                            {focusedInput === "roomId" && (
                                <motion.div
                                    className="absolute inset-0 -z-10 rounded-lg bg-primary/20 blur-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Username Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative"
                    >
                        <motion.div
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            animate={{
                                scale: focusedInput === "username" ? 1.1 : 1,
                                color:
                                    focusedInput === "username"
                                        ? "rgb(34, 197, 94)"
                                        : "rgb(156, 163, 175)",
                            }}
                        >
                            <Users className="h-5 w-5" />
                        </motion.div>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            className="w-full rounded-lg border border-gray-600 bg-darkHover/50 py-3 pl-11 pr-3 text-white transition-all duration-300 placeholder:text-gray-500 focus:border-primary focus:bg-darkHover focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onChange={handleInputChanges}
                            value={currentUser.username}
                            ref={usernameRef}
                            onFocus={() => setFocusedInput("username")}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <AnimatePresence>
                            {focusedInput === "username" && (
                                <motion.div
                                    className="absolute inset-0 -z-10 rounded-lg bg-primary/20 blur-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="relative w-full overflow-hidden rounded-lg bg-primary px-8 py-3.5 font-semibold text-black"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-400 to-primary"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Join Room
                            <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                →
                            </motion.div>
                        </span>
                    </motion.button>
                </form>

                {/* Generate Room ID Button */}
                <motion.button
                    className="group mt-6 flex items-center gap-2 text-primary underline-offset-4 transition-all hover:underline"
                    onClick={createNewRoomId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.div
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10"
                        whileHover={{ rotate: 180, backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                        transition={{ duration: 0.3 }}
                    >
                        <Sparkles className="h-4 w-4" />
                    </motion.div>
                    <span>Generate Unique Room Id</span>
                </motion.button>

                {/* Decorative Lines */}
                <div className="mt-6 flex w-full items-center gap-3">
                    <motion.div
                        className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                    />
                    <motion.div
                        className="h-2 w-2 rounded-full bg-primary/50"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

export default FormComponent