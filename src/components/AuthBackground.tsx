import { useEffect, useState } from 'react'

export default function AuthBackground() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; r: number }>>([])

  useEffect(() => {
    const pts = Array.from({ length: 25 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 60 + 20,
    }))
    setParticles(pts)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#0b3d2e] to-[#062a1f]">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-green-500/10 blur-[80px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.r}px`,
            height: `${p.r}px`,
            animation: `float ${6 + i * 0.5}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          from { transform: translate(0, 0); }
          to { transform: translate(20px, -30px); }
        }
      `}</style>
    </div>
  )
}