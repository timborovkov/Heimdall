interface HeimdallLogoProps {
  className?: string;
}

export default function HeimdallLogo({ className = "w-8 h-8" }: HeimdallLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Eye of Heimdall - Central watching eye */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Inner eye structure */}
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="hsl(var(--tactical-amber))"
        fillOpacity="0.1"
      />
      
      {/* Pupil */}
      <circle
        cx="50"
        cy="50"
        r="12"
        fill="hsl(var(--tactical-amber))"
      />
      
      {/* Radar sweep lines */}
      <path
        d="M50 5 L50 20"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M50 80 L50 95"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 50 L20 50"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M80 50 L95 50"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Diagonal radar lines */}
      <path
        d="M21.7 21.7 L31.5 31.5"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M68.5 68.5 L78.3 78.3"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M78.3 21.7 L68.5 31.5"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M31.5 68.5 L21.7 78.3"
        stroke="hsl(var(--tactical-amber))"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Detection arcs */}
      <path
        d="M 30 30 A 14 14 0 0 1 70 30"
        stroke="hsl(var(--tactical-green))"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 25 25 A 18 18 0 0 1 75 25"
        stroke="hsl(var(--tactical-green))"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Corner brackets for tactical feel */}
      <path
        d="M15 15 L15 25 M15 15 L25 15"
        stroke="hsl(var(--tactical-steel))"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M85 15 L85 25 M85 15 L75 15"
        stroke="hsl(var(--tactical-steel))"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M15 85 L15 75 M15 85 L25 85"
        stroke="hsl(var(--tactical-steel))"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M85 85 L85 75 M85 85 L75 85"
        stroke="hsl(var(--tactical-steel))"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}