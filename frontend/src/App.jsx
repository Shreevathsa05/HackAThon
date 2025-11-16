import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header/Header'

function App() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="mt-16 w-full h-full">
        <Outlet />
      </main>
    </div>
  )
}

export default App
