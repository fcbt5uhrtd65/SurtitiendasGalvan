import { useState, useEffect } from 'react';

export default function Countdown({ endTime, className = '' }: { endTime: number; className?: string }) {
  const [s, setS] = useState(() => Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
  useEffect(() => { const t = setInterval(() => setS(v => Math.max(0, v - 1)), 1000); return () => clearInterval(t); }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = pad(Math.floor(s / 3600)), m = pad(Math.floor((s % 3600) / 60)), sec = pad(s % 60);
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[h, m, sec].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-gray-900 text-white font-mono font-bold text-sm px-2 py-0.5 rounded-md min-w-[32px] text-center">{v}</span>
          {i < 2 && <span className="text-gray-400 font-bold">:</span>}
        </span>
      ))}
    </div>
  );
}
