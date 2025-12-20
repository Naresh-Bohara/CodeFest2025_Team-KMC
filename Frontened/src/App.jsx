import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MainRouter from './router/Router'
import ErrorBoundary from './components/shared/ErrorBoundary/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        
            <MainRouter /> 
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
