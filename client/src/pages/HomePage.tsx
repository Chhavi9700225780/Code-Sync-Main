// src/pages/HomePage.tsx

// src/pages/HomePage.tsx
import CodeScene3D from "@/components/CodeScene3D"
import Navbar from "@/components/Navbar"
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom"
import {
    Code2,
    Users,
    Zap,
    MessageSquare,
    Palette,
    Bot,
    PlayCircle,
    FileCode,
    Sparkles,
    Check,
    ArrowRight,
    GitBranch,
    Terminal,
    Cpu,
    Bell,
} from "lucide-react"
import logo from "@/assets/logo.svg"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

function HomePage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user state
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const features = [
        {
            icon: Code2,
            title: "Real-time Collaboration",
            description: "Code together seamlessly with multiple users in the same room",
            gradient: "from-primary to-emerald-400",
        },
        {
            icon: FileCode,
            title: "Multi-file Support",
            description: "Create, edit, and manage multiple files and folders",
            gradient: "from-emerald-400 to-teal-400",
        },
        {
            icon: Zap,
            title: "Instant Sync",
            description: "See changes in real-time across all connected users",
            gradient: "from-primary to-lime-400",
        },
        {
            icon: MessageSquare,
            title: "Group Chat",
            description: "Communicate with your team while coding",
            gradient: "from-teal-400 to-primary",
        },
        {
            icon: PlayCircle,
            title: "Code Execution",
            description: "Run code directly within the editor",
            gradient: "from-primary to-green-300",
        },
        {
            icon: Bot,
            title: "AI Copilot",
            description: "Get intelligent code suggestions and completions",
            gradient: "from-lime-400 to-primary",
        },
        {
            icon: Palette,
            title: "Customizable",
            description: "Multiple themes, fonts, and personalization options",
            gradient: "from-emerald-400 to-primary",
        },
        {
            icon: Users,
            title: "User Presence",
            description: "See who's online and what they're editing",
            gradient: "from-primary to-teal-400",
        },
    ]

    const codeSnippets = [
        { code: "const collaborate = true;", delay: 0 },
        { code: "function buildTogether() {", delay: 0.2 },
        { code: "  return realtime()", delay: 0.4 },
        { code: "}", delay: 0.6 },
    ]

    const floatingElements = [
        { icon: GitBranch, delay: 0, x: "10%", y: "20%" },
        { icon: Terminal, delay: 0.5, x: "85%", y: "15%" },
        { icon: Code2, delay: 1, x: "15%", y: "70%" },
        { icon: Cpu, delay: 1.5, x: "90%", y: "65%" },
    ]

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#1E293B]">
            {/* Enhanced Animated Background */}
             <Navbar />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Large Gradient Orbs */}
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
                    className="absolute -right-40 top-1/4 h-[700px] w-[700px] rounded-full bg-green-500/10 blur-[140px]"
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
                <motion.div
                    className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.35, 0.2],
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />

                {/* Floating Particles */}
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-primary/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}

                {/* Floating Code Icons */}
                {floatingElements.map((element, i) => {
                    const Icon = element.icon
                    return (
                        <motion.div
                            key={i}
                            className="absolute text-primary/10"
                            style={{ left: element.x, top: element.y }}
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 10, 0],
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                delay: element.delay,
                            }}
                        >
                            <Icon className="h-12 w-12" />
                        </motion.div>
                    )
                })}

                {/* Mouse Follow Gradient */}
                <motion.div
                    className="absolute h-[800px] w-[800px] rounded-full bg-primary/5 blur-[120px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 50,
                        stiffness: 100,
                    }}
                />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Hero Section - Completely Redesigned */}
            <div className="relative">
                <div className="container mx-auto px-4 py-12">
                    {/* Large Centered Logo */}
                    <motion.div
                        className="mb-8 -mt-12 flex justify-center pt-8"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            
                            
                            className="h-20 md:h-24"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
                    </motion.div>

                    {/* Main Hero Content */}
                    <div className="grid grid-cols-1  gap-16 lg:grid-cols-2 lg:gap-24">
                        {/* Left: Hero Text & Visuals */}
                        <div className="relative z-10 space-y-8">
                            {/* Badge */}
                            <motion.div
                                className="flex justify-center lg:justify-start"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-medium text-primary ring-1 ring-primary/20 backdrop-blur-sm">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    >
                                        <Sparkles className="h-5 w-5" />
                                    </motion.div>
                                    Real-time Collaborative Code Editor
                                </div>
                            </motion.div>

                            {/* Main Heading - Much Larger */}
                            <motion.h1
                                className="text-center text-4xl font-bold leading-[1.1] text-white md:text-5xl lg:text-left lg:text-6xl xl:text-7xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <span className="block">Code</span>
                                <span className="block">Together,</span>
                                <span className="bg-gradient-to-r from-primary via-emerald-400 to-green-300 bg-clip-text text-transparent">
                                    Ship Faster
                                </span>
                            </motion.h1>

                            {/* Subheading */}
                            <motion.p
                                className="mx-auto  max-w-2xl text-center text-xl text-gray-300 md:text-2xl lg:mx-0 lg:text-left"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                The most powerful collaborative coding platform with{" "}
                                <span className="font-semibold text-primary">
                                    real-time sync
                                </span>
                                ,{" "}
                                <span className="font-semibold text-primary">
                                    AI assistance
                                </span>
                                , and{" "}
                                <span className="font-semibold text-primary">
                                    instant execution
                                </span>
                                .
                            </motion.p>
                             
                        </div>

                        {/* Right: Form */}
                        <motion.div
                                                   className="relative z-10 flex justify-center lg:justify-end"
                                                   initial={{ opacity: 0, x: 50 }}
                                                   animate={{ opacity: 1, x: 0 }}
                                                   transition={{ duration: 0.8, delay: 0.4 }}
                                               >
                                                   <CodeScene3D />
                                               </motion.div>
                    </div>
                     {/* Change 1: Moved mt-10 here from the first child.
  You might also want a larger gap, like gap-6, to match your image.
*/}
{/* --- RESPONSIVE UPDATE --- */}
{/* Stacks vertically on mobile (flex-col), and becomes a row on medium screens and up (md:flex-row). */}
{/* Height is automatic on mobile, and fixed on larger screens. */}
<div className="flex flex-col md:flex-row gap-8 mt-16 md:mt-20 h-auto md:h-60">

    {/* Stats Box */}
    <motion.div
        className="grid flex-1 grid-cols-3 gap-6 rounded-xl border border-gray-700/50 bg-darkHover/50 p-6 text-center backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
    >
        {[
            { value: "∞", label: "Active Users", icon: Users },
            { value: "20+", label: "Languages", icon: Code2 },
            { value: "0ms", label: "Latency", icon: Zap },
        ].map((stat, index) => (
            <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
                // Adjusted top margin for better mobile layout
                className="group mt-4 md:mt-8 cursor-pointer"
            >
                <div className="mb-2 flex justify-center">
                    <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                        <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
                {/* Adjusted font size for mobile */}
                <div className="mb-1 bg-gradient-to-r from-primary to-green-300 bg-clip-text text-3xl md:text-4xl font-bold text-transparent">
                    {stat.value}
                </div>
                <div className="text-xs text-gray-400 md:text-sm">
                    {stat.label}
                </div>
            </motion.div>
        ))}
    </motion.div>

    {/* Code Snippet Box */}
    <motion.div
        // Added a minimum height on mobile to look good
        className="relative flex-1 rounded-xl border border-gray-700 bg-gray-900/80 p-6 backdrop-blur-sm min-h-[160px] md:min-h-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
    >
        <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="space-y-2 font-mono text-sm md:text-base">
            {codeSnippets.map((snippet, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + snippet.delay }}
                    className="flex items-center gap-3"
                >
                    <span className="text-gray-600">{i + 1}</span>
                    <span className="text-gray-300">{snippet.code}</span>
                    <motion.div
                        className="h-4 w-1 bg-primary"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0.7 + snippet.delay,
                        }}
                    />
                </motion.div>
            ))}
        </div>
    </motion.div>
</div>
                </div>
            </div>

            {/* Features Section - Enhanced */}
            <div id="features" className="container -mt-4 relative z-10 mx-auto px-4 py-24">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Sparkles className="h-4 w-4" />
                        Features
                    </motion.div>
                    <h2 className="mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl lg:text-6xl">
                        Everything You Need
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl text-gray-400">
                        Built for modern developers who demand speed, reliability, and seamless
                        collaboration
                    </p>
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <motion.div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl border border-gray-700 bg-darkHover/50 p-8 backdrop-blur-sm transition-all duration-300"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{
                                    scale: 1.03,
                                    borderColor: "rgba(34, 197, 94, 0.5)",
                                    y: -8,
                                }}
                            >
                                {/* Gradient Background on Hover */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                                />

                                {/* Glow Effect */}
                                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                <div className="relative z-10">
                                    <motion.div
                                        className="mb-6 inline-flex rounded-xl bg-primary/10 p-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20"
                                        whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Icon className="h-7 w-7 text-primary" />
                                    </motion.div>
                                    <h3 className="mb-3 text-xl font-semibold text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Corner Accent */}
                                <div className="absolute right-0 top-0 h-20 w-20 translate-x-10 -translate-y-10 rounded-full bg-primary/10 blur-2xl transition-all duration-300 group-hover:translate-x-5 group-hover:-translate-y-5 group-hover:bg-primary/20" />
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* How It Works Section - New */}
            <div id="how-it-works"  className="container relative z-10 mx-auto px-4 py-24">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                        Get Started in Seconds
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl text-gray-400">
                        Start collaborating with your team in three simple steps
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        {
                            step: "01",
                            title: "Create or Join Room",
                            description:
                                "Generate a unique room ID or join an existing one with your team",
                            icon: Users,
                        },
                        {
                            step: "02",
                            title: "Start Coding",
                            description:
                                "Write, edit, and collaborate in real-time with syntax highlighting",
                            icon: Code2,
                            },
                        {
                            step: "03",
                            title: "Execute & Share",
                            description:
                                "Run your code instantly and share results with your team",
                            icon: PlayCircle,
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            {/* Connecting Line */}
                            {index < 2 && (
                                <div className="absolute left-1/2 top-16 hidden h-1 w-full md:block">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary/50 to-primary/10"
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                                    />
                                </div>
                            )}

                            <motion.div
                                className="relative rounded-2xl border border-gray-700 bg-gradient-to-br from-darkHover/80 to-gray-900/80 p-8 backdrop-blur-sm"
                                whileHover={{ y: -5, borderColor: "rgba(34, 197, 94, 0.5)" }}
                            >
                                {/* Step Number */}
                                <div className="mb-6 flex items-center justify-between">
                                    <span className="bg-gradient-to-r from-primary to-green-300 bg-clip-text text-5xl font-bold text-transparent">
                                        {item.step}
                                    </span>
                                    <motion.div
                                        className="rounded-xl bg-primary/10 p-3"
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <item.icon className="h-6 w-6 text-primary" />
                                    </motion.div>
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-white">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400">{item.description}</p>

                                {/* Decorative Corner */}
                                <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-primary/5 blur-2xl" />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Advanced Features Section - Redesigned */}
            <div id="about" className="container relative z-10 mx-auto px-4 py-24">
                <motion.div
                    className="relative overflow-hidden rounded-3xl border border-gray-700 bg-gradient-to-br from-darkHover/80 via-gray-900/80 to-darkHover/80 p-8 backdrop-blur-sm lg:p-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Decorative Elements */}
                    <div className="absolute right-0 top-0 h-64 w-64 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-64 w-64 bg-gradient-to-tr from-green-500/10 to-transparent blur-3xl" />

                    <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
                                <Code2 className="h-4 w-4" />
                                Advanced Features
                            </div>
                            <h3 className="mb-6 text-3xl font-bold text-white md:text-4xl">
                                Professional Tools for
                                <span className="block bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent">
                                    Pro Developers
                                </span>
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Syntax highlighting with auto-language detection",
                                    "Real-time cursor and selection tracking",
                                    "Download entire codebase as ZIP",
                                    "Collaborative drawing canvas",
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-start gap-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                    >
                                        <motion.div
                                            className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20"
                                            whileHover={{ scale: 1.3, rotate: 360 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Check className="h-4 w-4 text-primary" />
                                        </motion.div>
                                        <span className="text-lg text-gray-300">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
                                <Bell className="h-4 w-4" />
                                Smart Notifications
                            </div>
                            <h3 className="mb-6 text-3xl font-bold text-white md:text-4xl">
                                Stay in Sync with
                                <span className="block bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent">
                                    Real-time Updates
                                </span>
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "User join/leave notifications",
                                    "Online/offline status indicators",
                                    "Real-time tooltips for active editors",
                                    "Auto-suggestion based on language",
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-start gap-4"
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                    >
                                        <motion.div
                                            className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20"
                                            whileHover={{ scale: 1.3, rotate: 360 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Check className="h-4 w-4 text-primary" />
                                        </motion.div>
                                        <span className="text-lg text-gray-300">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* CTA Section - New */}
            <div className="container relative z-10 mx-auto px-4 py-24">
                <motion.div
                    className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-green-500/5 p-12 text-center backdrop-blur-sm lg:p-20"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Animated Background */}
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{
                            backgroundPosition: ["0% 0%", "100% 100%"],
                        }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                        style={{
                            backgroundImage:
                                "radial-gradient(circle, rgba(34,197,94,0.1) 1px, transparent 1px)",
                            backgroundSize: "50px 50px",
                        }}
                    />

                    <div className="relative z-10">
                        <motion.div
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-6 py-3 text-sm font-medium text-primary backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Sparkles className="h-5 w-5" />
                            Ready to get started?
                        </motion.div>
                        <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            Start Collaborating
                            <span className="block bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent">
                                Today
                            </span>
                        </h2>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                            Join thousands of developers building amazing projects together
                        </p>
                       <motion.a
            // REMOVED: href="#form"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-black shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                // Navigate based on user login status
                if (user) {
                    navigate('/get-started');
                } else {
                    navigate('/login');
                }
            }}
        >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
        </motion.a>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
             
            <motion.div
                className="relative z-10 border-t  border-green-500 py-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-3">
                            <img src={logo} 
                            className="h-16"
                            alt="Code Sync"  />
                           
                        </div>
                        <p className="text-center text-gray-400">
                            Built for developers who love to collaborate
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>© 2025 Code Sync</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default HomePage