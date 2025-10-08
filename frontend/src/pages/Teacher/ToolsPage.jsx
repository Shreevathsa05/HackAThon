import React from 'react'

function ToolsPage() {
  return (
    <iframe
    src='https://hack-a-thon-extension.vercel.app'
    title='MiniMeet'
    width='100%'
    height='130%'
    style={{ border: 'none', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
    allow='camera; microphone; fullscreen; speaker; display-capture'
    allowFullScreen
    >
      
    </iframe>
  )
}

export default ToolsPage