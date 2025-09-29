import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './components/Header/Header'

function App() {

  return (
    <div className="flex flex-col">
      <Header />
      <main className='mt-16'>
        <Outlet />
      </main>
    </div>
  )
}

export default App
