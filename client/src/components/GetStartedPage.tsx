import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import FormComponent from "@/components/forms/FormComponent"
import logo from "@/assets/logo.svg"

export default function GetStartedPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#1E293B]">
            {/* Animated Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute -right-40 bottom-0 h-[700px] w-[700px] rounded-full bg-green-500/10 blur-[140px]"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex min-h-screen flex-col">
                {/* Header */}
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <Link to="/">
                            <motion.button
                                className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
                                whileHover={{ x: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Back to Home</span>
                            </motion.button>
                        </Link>
 <motion.button
                            
                            className="flex items-center gap-3 transition-transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <img
                                src={logo}
                                alt="Code Sync"
                                className="transition-all duration-300 h-16" 
                            />
                           
                        </motion.button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 items-center justify-center px-4 py-12">
                    <div className="w-full max-w-6xl">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            {/* Left: Info */}
                            <motion.div
                                className="text-center lg:text-left"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.h1
                                    className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                  Connect Code ,
                                    <span className="block bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent">
                                        Collaborate
                                    </span>
                                </motion.h1>

                                <motion.p
                                    className="mb-8 text-xl text-gray-300"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Enter a Room ID to join or generate a new one to start
                                    collaborating with your team instantly.
                                </motion.p>

                                <motion.div
                                    className="space-y-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        </div>
                                        <p className="text-left text-gray-400">
                                            Real-time synchronization across all team members
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        </div>
                                        <p className="text-left text-gray-400">
                                            Secure rooms with unique IDs
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        </div>
                                        <p className="text-left text-gray-400">
                                            No installation required - start coding immediately
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Right: Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <FormComponent />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}