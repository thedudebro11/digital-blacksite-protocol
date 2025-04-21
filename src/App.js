// ✅ Fully Modular app.js with Reversible Buttons for All Actions
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import clickSound from './assets/click.mp3'
import reverseIcon from './assets/reverse.png'
import ReversibleButton from './ReversibleButton'
import './App.css'

const reversibleActions = [
  {
    label: 'Create BlacksiteUser',
    reset: 'Remove BlacksiteUser'
  },
  {
    label: 'Block All Outbound Traffic',
    reset: 'Reverse Lockdown'
  },
  {
    label: 'Whitelist Essential Programs',
    reset: 'Unwhitelist Essential Programs'
  },
  {
    label: 'Block Cracked EXEs',
    reset: 'Unblock Cracked EXEs'
  },
  {
    label: 'Inject Sinkhole into HOSTS File',
    reset: 'Remove Sinkhole from HOSTS File'
  },
  {
    label: 'Enable Controlled Folder Access',
    reset: 'Disable Controlled Folder Access'
  },
  {
    label: 'Disable All Network Interfaces',
    reset: 'Enable All Network Interfaces'
  }
]

const oneWayActions = ['Run BleachBit Cleanup']

export default function BlacksiteLauncher() {
  const [status, setStatus] = useState('Awaiting deployment...')
  const audio = new Audio(clickSound)

  useEffect(() => {
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
    window.electronAPI.runCommand(label)
  }

  return (
    <div className="app-container">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="title glow-text"
      >
        🕵️‍♂️ Digital Blacksite Protocol
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="panel-container"
      >
        <div className="grid-buttons">
          {reversibleActions.map((action, index) => (
            <ReversibleButton
              key={index}
              label={action.label}
              resetLabel={action.reset}
              onClick={handleAction}
              icon={reverseIcon}
            />
          ))}

          {oneWayActions.map((label) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction(label)}
              className="main-button"
            >
              {label}
            </motion.button>
          ))}
        </div>
        <p className="status-text">Status: {status}</p>
      </motion.div>
    </div>
  )
}
