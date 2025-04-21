// Digital Blacksite Protocol - Cyberpunk GUI Template
// Includes: Neon aesthetic, smooth motion, and audio feedback

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import clickSound from './assets/click.mp3'
import './App.css' // We'll use custom CSS for glow effects and fonts

export default function BlacksiteLauncher() {
  const [status, setStatus] = useState('Awaiting deployment...')
  const audio = new Audio(clickSound)
  React.useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onResponse((data) => {
        setStatus(data)
      })
    }
  }, [])
  

  const handleAction = (label) => {
    audio.currentTime = 0
    audio.play()
    setStatus(`Executing ${label}...`)
    setStatus(`Executing ${label}...`)
window.electronAPI.runCommand(label)

  }

  const actions = [
    'Create BlacksiteUser',
    'Block All Outbound Traffic',
    'Whitelist Essential Programs',
    'Block Cracked EXEs',
    'Inject Sinkhole into HOSTS File',
    'Enable Controlled Folder Access',
    'Disable All Network Interfaces',
    'Run BleachBit Cleanup'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-400 p-6 font-cyber">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="text-4xl mb-6 text-center glow-text"
      >
        🕶️ Digital Blacksite Protocol
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-white/5 backdrop-blur-md border border-green-600 p-6 rounded-2xl shadow-lg shadow-green-500/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((label, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction(label)}
              className="bg-green-600/20 border border-green-400 text-green-200 hover:bg-green-400 hover:text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-green-500/70"
            >
              {label}
            </motion.button>
          ))}
        </div>
        <p className="mt-6 text-sm text-center glow-text">Status: {status}</p>
      </motion.div>
    </div>
  )
}