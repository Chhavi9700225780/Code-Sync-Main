import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Added ArrowRight for the Get Started button
import { Menu, X, ChevronRight, LogOut, User as UserIcon, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
// --- FIX: Double-checking relative path ---
// This assumes Navbar.tsx is in src/components/ and AuthContext.tsx is in src/context/
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const { user, setUser, isLoading, setToken } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            if (location.pathname !== "/") {
                 setActiveSection("");
                 return;
            }
            const sections = ["features", "how-it-works", "about"];
            const scrollOffset = isScrolled ? 80 : 100;
            const scrollPosition = window.scrollY + scrollOffset;
            let currentSection = "";
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        currentSection = section;
                        break;
                    }
                }
            }
             if (window.scrollY + window.innerHeight >= document.body.offsetHeight - 50) {
                 // Keep last section active near bottom if preferred
             } else if (window.scrollY < 150 && currentSection === "") {
                 // Keep empty near top
             }
             setActiveSection(currentSection);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname, isScrolled]);

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "About", href: "#about" },
    ];

    const scrollToSection = (href: string) => {
        if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
                document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 150);
        } else {
            document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setIsMobileMenuOpen(false);
    };

    const scrollToTop = () => {
        if (location.pathname !== "/") navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsMobileMenuOpen(false);
    };

    const handleLogin = () => { navigate("/login"); setIsMobileMenuOpen(false); };
    const handleSignup = () => { navigate("/signup"); setIsMobileMenuOpen(false); };

    // --- ADDED Get Started Handler ---
    const handleGetStarted = () => {
        navigate("/get-started"); // Navigate to the get-started page
        setIsMobileMenuOpen(false);
    };
    // --- END Get Started Handler ---

    const handleLogout = () => {
        setIsMobileMenuOpen(false);
        const toastId = toast.loading("Logging out...");
        try {
            setToken(null);
            setUser(null);
            toast.success("Logged out successfully", { id: toastId });
            navigate("/");
        } catch (error) {
            console.error("Logout error (unexpected):", error);
            toast.error("Logout failed.", { id: toastId });
        }
    };

    // --- Render Auth Buttons ---
    const renderAuthButtons = (isMobile: boolean = false) => {
        if (isLoading) {
            return (
                <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-2'}`}>
                    <div className="h-8 w-16 animate-pulse rounded-full bg-gray-700"></div>
                    <div className="h-8 w-20 animate-pulse rounded-full bg-gray-600"></div>
                </div>
            );
        }

        if (user) {
            // --- User is logged in ---
            return (
                // Adjusted gap for three items
                <div className={`flex ${isMobile ? 'flex-col gap-4 items-stretch' : 'items-center gap-3'}`}>
                   
                   
                   
                   
                    {/* Username */}
                    <span className={`flex items-center gap-2 text-gray-300 ${isMobile ? 'justify-center py-2 text-lg' : 'text-sm'}`}>
                        <UserIcon className="h-5 w-5 text-primary" />
                        <span className="truncate max-w-[80px] md:max-w-[120px]">{user.username}</span>
                    </span>

                   

                    {/* Logout Button */}
                    <motion.button
                        onClick={handleLogout}
                         // Use slightly different style to distinguish from Get Started
                        className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-full ${isMobile ? 'w-full py-3 text-base bg-gray-600 hover:bg-gray-500' : 'px-5 py-2 text-xs'} bg-gray-700 font-semibold text-white transition-all hover:bg-gray-600`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Log Out" // Add title for clarity
                    >
                        <LogOut className="h-4 w-4" />
                        {/* Optionally hide text on smaller screens if too crowded */}
                        <span className={isMobile ? '' : 'hidden sm:inline'}>Log Out</span>
                    </motion.button>


                     {/* Get Started Button (Logged In) */}
                    <motion.button
                        onClick={handleGetStarted}
                        // Use similar styling as original signup, adjust padding/size
                        className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary font-semibold text-black transition-all hover:shadow-lg hover:shadow-primary/40 ${isMobile ? 'w-full py-4 text-lg' : 'px-6 py-2.5 text-sm'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </div>
            );
        }

        // User is logged out
        return (
            <div className={`flex ${isMobile ? 'flex-col gap-4 items-stretch' : 'items-center gap-2'}`}>
                {/* Log In Button */}
                <motion.button
                    onClick={handleLogin}
                    className={`rounded-full px-6 py-2.5 font-semibold text-gray-300 transition-colors hover:text-white ${isMobile ? 'w-full py-4 text-lg text-center bg-gray-700 hover:bg-gray-600' : 'text-sm'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Log In
                </motion.button>
                {/* Sign Up Button (was previously Get Started when logged out) */}
                <motion.button
                    onClick={handleSignup} // Changed from handleGetStarted
                    className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary font-semibold text-black transition-all hover:shadow-lg hover:shadow-primary/40 ${isMobile ? 'w-full py-4 text-lg' : 'px-6 py-2.5 text-sm'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* <Sparkles className="h-4 w-4" /> */} {/* Removed icon for cleaner look */}
                    Sign Up
                </motion.button>
            </div>
        );
    };

    return (
        <>
            <motion.nav
                 className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[#1E293B]/80 py-3 shadow-lg backdrop-blur-xl" : "bg-transparent py-5"}`}
                 initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
             >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <motion.button onClick={scrollToTop} className="flex items-center gap-2 transition-transform hover:scale-105" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                             <svg className={`transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'} w-auto text-primary`} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 30L13.3333 25M30 30L26.6667 25M10 10H30L20 25L10 10Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.6667 10L20 15L23.3333 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                             <span className={`text-xl font-bold text-white transition-opacity duration-300 ${isScrolled ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>CodeSync</span>
                        </motion.button>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center gap-1 md:flex">
                            {navLinks.map((link, index) => (
                                <motion.button key={link.name} onClick={() => scrollToSection(link.href)} className="group relative px-4 py-2 text-gray-300 transition-colors hover:text-white" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                                    {link.name}
                                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-green-300 origin-center" initial={{ scaleX: 0 }} animate={{ scaleX: activeSection === link.href.substring(1) ? 1 : 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.3 }} />
                                </motion.button>
                            ))}
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex">
                            {renderAuthButtons(false)}
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="flex items-center justify-center rounded-lg border border-gray-700 bg-darkHover/50 p-2 backdrop-blur-sm transition-colors hover:border-primary/50 md:hidden" whileTap={{ scale: 0.9 }} aria-label="Toggle mobile menu" >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen ? (<motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} ><X className="h-6 w-6 text-white" /></motion.div>)
                                : (<motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} ><Menu className="h-6 w-6 text-white" /></motion.div>)}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
                 {/* Glowing Border */}
                 {isScrolled && (<motion.div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }} />)}
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} />
                        {/* Menu Panel */}
                        <motion.div className="fixed right-0 top-0 z-50 h-full w-full max-w-xs border-l border-gray-700 bg-[#1E293B]/95 backdrop-blur-xl md:hidden overflow-y-auto" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-700 p-5">
                                <div className="flex items-center gap-2">
                                     <svg className="h-8 w-auto text-primary" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 30L13.3333 25M30 30L26.6667 25M10 10H30L20 25L10 10Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.6667 10L20 15L23.3333 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <span className="text-lg font-bold text-white">CodeSync</span>
                                </div>
                                <motion.button onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-darkHover hover:text-white" whileTap={{ scale: 0.9 }} aria-label="Close mobile menu" >
                                    <X className="h-6 w-6" />
                                </motion.button>
                            </div>
                            {/* Links & Auth */}
                            <div className="flex flex-col p-4">
                                {navLinks.map((link, index) => (
                                    <motion.button key={link.name} onClick={() => scrollToSection(link.href)} className="group flex items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-darkHover" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 + 0.1 }} whileTap={{ scale: 0.98 }} >
                                        <span className="text-base text-gray-300 transition-colors group-hover:text-white">{link.name}</span>
                                        <ChevronRight className="h-5 w-5 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                                    </motion.button>
                                ))}
                                <div className="mt-6 border-t border-gray-700 pt-6">
                                     {renderAuthButtons(true)}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

