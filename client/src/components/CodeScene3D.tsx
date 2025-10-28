import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Particle {
    x: number
    y: number
    z: number
    vx: number
    vy: number
    vz: number
    size: number
    color: string
    alpha: number
}

interface NetworkNode {
    x: number
    y: number
    z: number
    targetX: number
    targetY: number
    targetZ: number
    color: string
    connections: number[]
    pulsePhase: number
}

export default function CodeScene3D() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let width = 0
        let height = 0
        let centerX = 0
        let centerY = 0

        const updateSize = () => {
            const rect = canvas.getBoundingClientRect()
            width = rect.width
            height = rect.height
            canvas.width = width * window.devicePixelRatio
            canvas.height = height * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
            centerX = width / 2
            centerY = height / 2
        }
        updateSize()
        window.addEventListener("resize", updateSize)

        // 3D projection helper
        const project = (x: number, y: number, z: number, fov: number = 800) => {
            const scale = fov / (fov + z)
            return {
                x: x * scale + centerX,
                y: y * scale + centerY,
                scale: scale
            }
        }

        // Create network nodes (users)
        const nodes: NetworkNode[] = []
        const nodeColors = [
            { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' },
            { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
            { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
            { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)' },
            { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)' }
        ]

        const radius = 250
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2
            nodes.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z: 0,
                targetX: Math.cos(angle) * radius,
                targetY: Math.sin(angle) * radius,
                targetZ: 0,
                color: nodeColors[i].primary,
                connections: i === 0 ? [1, 2, 3, 4] : [0],
                pulsePhase: i * 0.4
            })
        }

        // Particle system for ambient effect
        const particles: Particle[] = []
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: (Math.random() - 0.5) * 800,
                y: (Math.random() - 0.5) * 800,
                z: (Math.random() - 0.5) * 1000,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                vz: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                color: Math.random() > 0.5 ? '#22c55e' : '#3b82f6',
                alpha: Math.random() * 0.5 + 0.2
            })
        }

        // Rotating code lines
        let codeRotation = 0
        const codeLines = [
            'const editor = new CollabEditor()',
            'socket.on("code-sync", handleSync)',
            'room.join(roomId)',
            'users.forEach(u => u.cursor)',
            'await db.saveChanges()',
            'export { RealTimeEditor }'
        ]

        // Animation variables
        let time = 0
        const mouse = { x: 0, y: 0 }
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = ((e.clientX - rect.left) / width - 0.5) * 100
            mouse.y = ((e.clientY - rect.top) / height - 0.5) * 100
        })

        const drawParticles = () => {
            particles.forEach(p => {
                p.x += p.vx
                p.y += p.vy
                p.z += p.vz

                // Wrap around
                if (Math.abs(p.x) > 400) p.vx *= -1
                if (Math.abs(p.y) > 400) p.vy *= -1
                if (Math.abs(p.z) > 500) p.vz *= -1

                const proj = project(p.x, p.y, p.z)
                
                if (proj.scale > 0.3 && proj.scale < 2) {
                    ctx.beginPath()
                    ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2)
                    ctx.fillStyle = p.color + Math.floor(p.alpha * proj.scale * 255).toString(16).padStart(2, '0')
                    ctx.fill()
                }
            })
        }

        const drawConnections = () => {
            nodes.forEach((node, i) => {
                node.connections.forEach(targetIndex => {
                    const target = nodes[targetIndex]
                    
                    const startProj = project(node.x, node.y, node.z)
                    const endProj = project(target.x, target.y, target.z)

                    // Draw connection line
                    const gradient = ctx.createLinearGradient(startProj.x, startProj.y, endProj.x, endProj.y)
                    gradient.addColorStop(0, node.color + '40')
                    gradient.addColorStop(0.5, '#22c55e80')
                    gradient.addColorStop(1, target.color + '40')

                    ctx.beginPath()
                    ctx.moveTo(startProj.x, startProj.y)
                    ctx.lineTo(endProj.x, endProj.y)
                    ctx.strokeStyle = gradient
                    ctx.lineWidth = 2
                    ctx.stroke()

                    // Animated data packets
                    const numPackets = 3
                    for (let p = 0; p < numPackets; p++) {
                        const progress = ((time * 0.0005 + p / numPackets + i * 0.1) % 1)
                        const px = node.x + (target.x - node.x) * progress
                        const py = node.y + (target.y - node.y) * progress
                        const pz = node.z + (target.z - node.z) * progress
                        
                        const packetProj = project(px, py, pz)
                        
                        const packetAlpha = Math.sin(progress * Math.PI)
                        ctx.beginPath()
                        ctx.arc(packetProj.x, packetProj.y, 4 * packetProj.scale, 0, Math.PI * 2)
                        
                        const packetGradient = ctx.createRadialGradient(
                            packetProj.x, packetProj.y, 0,
                            packetProj.x, packetProj.y, 4 * packetProj.scale
                        )
                        packetGradient.addColorStop(0, `rgba(255, 255, 255, ${packetAlpha})`)
                        packetGradient.addColorStop(0.5, node.color + Math.floor(packetAlpha * 200).toString(16).padStart(2, '0'))
                        packetGradient.addColorStop(1, node.color + '00')
                        
                        ctx.fillStyle = packetGradient
                        ctx.fill()
                    }
                })
            })
        }

        const drawNodes = () => {
            // Sort nodes by z-depth
            const sortedNodes = [...nodes].sort((a, b) => b.z - a.z)

            sortedNodes.forEach((node) => {
                // Update node position with smooth movement
                const targetAngle = (nodes.indexOf(node) / nodes.length) * Math.PI * 2 + codeRotation * 0.3
                node.targetX = Math.cos(targetAngle) * radius + mouse.x * 0.5
                node.targetY = Math.sin(targetAngle) * radius + mouse.y * 0.5
                node.targetZ = Math.sin(time * 0.0003 + node.pulsePhase) * 100

                node.x += (node.targetX - node.x) * 0.05
                node.y += (node.targetY - node.y) * 0.05
                node.z += (node.targetZ - node.z) * 0.05

                const proj = project(node.x, node.y, node.z)
                
                // Pulse effect
                const pulse = 1 + Math.sin(time * 0.003 + node.pulsePhase) * 0.2
                const baseSize = 25
                const size = baseSize * pulse * proj.scale

                // Outer glow rings
                for (let ring = 0; ring < 3; ring++) {
                    ctx.beginPath()
                    ctx.arc(proj.x, proj.y, size * (2 + ring * 0.5), 0, Math.PI * 2)
                    const glowAlpha = (0.15 - ring * 0.04) * proj.scale
                    ctx.strokeStyle = node.color + Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')
                    ctx.lineWidth = 2
                    ctx.stroke()
                }

                // Main node sphere
                const gradient = ctx.createRadialGradient(
                    proj.x - size * 0.3, proj.y - size * 0.3, 0,
                    proj.x, proj.y, size
                )
                gradient.addColorStop(0, '#ffffff')
                gradient.addColorStop(0.3, node.color)
                gradient.addColorStop(1, node.color + 'cc')

                ctx.beginPath()
                ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()

                // Inner highlight
                ctx.beginPath()
                ctx.arc(proj.x - size * 0.3, proj.y - size * 0.3, size * 0.3, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
                ctx.fill()

                // Outer ring
                ctx.beginPath()
                ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2)
                ctx.strokeStyle = node.color
                ctx.lineWidth = 2
                ctx.stroke()
            })
        }

        const drawFloatingCode = () => {
            codeLines.forEach((line, i) => {
                const angle = (i / codeLines.length) * Math.PI * 2 + codeRotation
                const r = 400
                const x = Math.cos(angle) * r
                const y = Math.sin(angle) * r + Math.sin(time * 0.001 + i) * 50
                const z = Math.cos(time * 0.001 + i) * 200 - 200

                const proj = project(x, y, z)

                if (proj.scale > 0.3 && proj.scale < 1.5) {
                    ctx.save()
                    ctx.globalAlpha = Math.min(1, proj.scale) * 0.4

                    ctx.font = `${14 * proj.scale}px 'Courier New', monospace`
                    ctx.fillStyle = '#22c55e'
                    ctx.textAlign = 'center'
                    ctx.fillText(line, proj.x, proj.y)

                    ctx.restore()
                }
            })

            codeRotation += 0.002
        }

        const drawCentralGlow = () => {
            // Central energy core
            const glowSize = 150 + Math.sin(time * 0.002) * 30
            
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize)
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.15)')
            gradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.08)')
            gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.05)')
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')

            ctx.beginPath()
            ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2)
            ctx.fillStyle = gradient
            ctx.fill()

            // Rotating ring
            ctx.save()
            ctx.translate(centerX, centerY)
            ctx.rotate(time * 0.001)
            
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2
                const x = Math.cos(angle) * 80
                const y = Math.sin(angle) * 80
                
                ctx.beginPath()
                ctx.arc(x, y, 3, 0, Math.PI * 2)
                ctx.fillStyle = '#22c55e'
                ctx.fill()
            }
            
            ctx.restore()
        }

        const drawBackground = () => {
            // Gradient background
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
            gradient.addColorStop(0, '#1e293b')
            gradient.addColorStop(1, '#0f172a')
            
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)

            // Grid
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.03)'
            ctx.lineWidth = 1

            const gridSpacing = 50
            for (let x = 0; x < width; x += gridSpacing) {
                ctx.beginPath()
                ctx.moveTo(x, 0)
                ctx.lineTo(x, height)
                ctx.stroke()
            }
            for (let y = 0; y < height; y += gridSpacing) {
                ctx.beginPath()
                ctx.moveTo(0, y)
                ctx.lineTo(width, y)
                ctx.stroke()
            }
        }

        let animationId: number

        const animate = () => {
            time += 16

            drawBackground()
            drawCentralGlow()
            drawParticles()
            drawFloatingCode()
            drawConnections()
            drawNodes()

            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener("resize", updateSize)
        }
    }, [])

    return (
        <motion.div
            className="relative rounded-xl h-full w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ width: "100%", height: "100%" }}
            />

            {/* Title Overlay */}
            <motion.div
                className="absolute left-1/2 top-12 -translate-x-1/2"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
            >
                <div className="text-center">
                    <h1 className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Code Sync Network
                    </h1>
                    <p className="mt-2 font-mono text-sm text-primary/60">
                        Real-time collaborative editing in action
                    </p>
                </div>
            </motion.div>

            {/* Stats Panel - Bottom */}
            <motion.div
                className="absolute bottom-24 left-20 -translate-x-1/2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
            >
                <div className="flex  gap-6 rounded-2xl border border-primary/20 bg-gray-950/80 px-8 py-4 backdrop-blur-xl">
                    <div className="text-center">
                        <div className="font-mono text-2xl text-primary">5</div>
                        <div className="mt-1 font-mono text-xs text-primary/60">Active Users</div>
                    </div>
                    <div className="h-full w-px bg-primary/20" />
                    <div className="text-center">
                        <div className="font-mono text-2xl text-blue-400">12</div>
                        <div className="mt-1 font-mono text-xs text-primary/60">Connections</div>
                    </div>
                    <div className="h-full w-px bg-primary/20" />
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                            <span className="font-mono text-2xl text-green-400">Live</span>
                        </div>
                        <div className="mt-1 font-mono text-xs text-primary/60">Status</div>
                    </div>
                </div>
            </motion.div>

            {/* Feature Tags */}
            <motion.div
                className="absolute right-8 top-8 space-y-3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 1 }}
            >
                {[
                    { icon: '⚡', label: 'Real-time Sync', color: 'from-yellow-400 to-orange-500' },
                    { icon: '🔗', label: 'P2P Connections', color: 'from-blue-400 to-cyan-500' },
                    { icon: '🚀', label: 'Low Latency', color: 'from-green-400 to-emerald-500' }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-primary/20 bg-gray-950/80 px-4 py-2 backdrop-blur-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                    >
                        <span className="text-xl">{feature.icon}</span>
                        <span className={`bg-gradient-to-r ${feature.color} bg-clip-text font-mono text-sm text-transparent`}>
                            {feature.label}
                        </span>
                    </motion.div>
                ))}
            </motion.div>

            {/* Room Info */}
            <motion.div
                className="absolute left-8 top-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 1 }}
            >
                <div className="rounded-xl border border-primary/20 bg-gray-950/80 p-4 backdrop-blur-xl">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="font-mono text-xs text-primary/80">Room Active</span>
                    </div>
                    <div className="font-mono text-sm text-primary/60">
                        ID: <span className="text-primary">xyz-789</span>
                    </div>
                    <div className="mt-2 font-mono text-xs text-primary/40">
                        Sync: 45ms
                    </div>
                </div>
            </motion.div>

            {/* Decorative corner elements */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-32 w-32 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
                <div className="absolute bottom-0 right-0 h-32 w-32 bg-gradient-to-tl from-blue-500/10 to-transparent blur-3xl" />
            </div>
        </motion.div>
    )
}
