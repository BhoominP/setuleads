export function AmbientBackground() {
  return (
    <>
      {/* Subtle Film Grain Texture */}
      <div className="film-grain" aria-hidden="true" />

      {/* Slow Moving Ambient Radial Light Leaks */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Top-right subtle orange radial glow */}
        <div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #FF4A00 0%, #C43D1C 50%, transparent 80%)',
            animation: 'pulse 12s ease-in-out infinite alternate'
          }}
        />

        {/* Bottom-left faint deep amber radial glow */}
        <div 
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.08] blur-[140px]"
          style={{
            background: 'radial-gradient(circle, #FF5A00 0%, #7F1D1D 50%, transparent 80%)',
            animation: 'pulse 16s ease-in-out infinite alternate-reverse'
          }}
        />
      </div>
    </>
  );
}

