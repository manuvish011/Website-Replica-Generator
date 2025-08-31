import React, { useState } from 'react'
import { Globe, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import WebsiteReplicator from './components/WebsiteReplicator'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              Website Replica Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Capture any website's HTML, CSS, and images into a downloadable ZIP file. 
            Perfect for offline browsing, learning, and archiving web content.
          </p>
        </header>

        <WebsiteReplicator />

        <footer className="mt-16 text-center text-gray-500">
          <p className="mb-2">Built with React • Fully client-side • No data leaves your browser</p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              No backend required
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              Privacy focused
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              Open source
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App