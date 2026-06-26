import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function Gauge({ value = 0, min = 0, max = 100, label = '', size = 180, strokeWidth = 14, colorStops = [] }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.max(min, Math.min(max, animatedValue));
  const percentage = (normalizedValue - min) / (max - min);
  const dashOffset = circumference - percentage * circumference * 0.75;
  const startAngle = 135;

  const defaultColorStops = [
    { value: 0, color: '#00ff88' },
    { value: 50, color: '#ffaa00' },
    { value: 80, color: '#ff3366' },
  ];

  const stops = colorStops.length > 0 ? colorStops : defaultColorStops;

  const getColor = () => {
    const pct = percentage * 100;
    for (let i = stops.length - 1; i >= 0; i--) {
      const stopPct = ((stops[i].value - min) / (max - min)) * 100;
      if (pct >= stopPct) {
        return stops[i].color;
      }
    }
    return stops[0].color;
  };

  const gaugeColor = getColor();
  const gradientId = `gauge-gradient-${label.replace(/\s+/g, '-')}`;

  return (
    <div className="gauge-container">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {stops.map((stop, i) => (
                <stop
                  key={i}
                  offset={`${((stop.value - min) / (max - min)) * 100}%`}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
            <filter id={`glow-${gradientId}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          />

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
            filter={`url(#glow-${gradientId})`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -40%)',
            textAlign: 'center',
          }}
        >
          <motion.div
            style={{
              fontSize: size * 0.2,
              fontWeight: 800,
              color: gaugeColor,
              lineHeight: 1,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(animatedValue)}
          </motion.div>
          <div
            style={{
              fontSize: size * 0.065,
              color: '#94a3b8',
              marginTop: 4,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 600,
            }}
          >
            / {max}
          </div>
        </div>
      </div>
      {label && <div className="gauge-label">{label}</div>}
    </div>
  );
}

export default Gauge;
