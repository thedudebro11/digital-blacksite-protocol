// ReversibleButton.jsx - Modular Reversible Action Button Component
import React from 'react'
import { motion } from 'framer-motion'

export default function ReversibleButton({ label, resetLabel, onClick, icon }) {
  return (
    <div className="flex gap-2 items-stretch w-full max-w-[400px]">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(label)}
        className="main-button"
      >
        {label}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(resetLabel)}
        title={`Reverse ${label}`}
        className="reverse-btn"
      >
        <img src={icon} alt="Reverse" className="w-5 h-5 object-contain" />
      </motion.button>
    </div>
  )
}