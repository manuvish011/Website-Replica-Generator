import React, { useState } from 'react'
import { Download, Loader, AlertCircle, CheckCircle, Globe, Image, FileText } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const WebsiteReplicator = () => {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle, fetching, success, error
  const [progress, setProgress] = useState('')
  const [downloadReady, setDownloadReady] = useState(false)
  const [zipBlob, setZipBlob] = useState(null)
  const [stats, setStats] = useState({ images: 0, stylesheets: 0, totalSize: 0 })

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const fetchWithCors = async (url) => {
    // Try direct fetch first
    try {
      const response = await fetch(url)
      if (response.ok) {
        return response
      }
    } catch (error) {
      // If direct fetch fails, try with CORS proxy
    }
    
    // Use CORS proxy as fallback
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    return fetch(proxyUrl)
  }

  const downloadAsset = async (assetUrl, baseUrl) => {
    try {
      const absoluteUrl = new URL(assetUrl, baseUrl).href
      const response = await fetchWithCors(absoluteUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${assetUrl}`)
      }
      
      const blob = await response.blob()
      return {
        url: assetUrl,
        blob: blob,
        size: blob.size
      }
    } catch (error) {
      console.warn(`Failed to download asset: ${assetUrl}`, error)
      return null
    }
  }

  const extractAssets = (html, baseUrl) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const assets = {
      images: [],
      stylesheets: [],
      scripts: []
    }

    // Extract images
    const images = doc.querySelectorAll('img[src]')
    images.forEach(img => {
      const src = img.getAttribute('src')
      if (src && !src.startsWith('data:')) {
        assets.images.push(src)
      }
    })

    // Extract stylesheets
    const links = doc.querySelectorAll('link[rel="stylesheet"][href]')
    links.forEach(link => {
      const href = link.getAttribute('href')
      if (href) {
        assets.stylesheets.push(href)
      }
    })

    // Extract inline styles and update image references
    const styles = doc.querySelectorAll('style')
    styles.forEach(style => {
      const cssText = style.textContent
      const imageMatches = cssText.match(/url\(['"]?([^'")\s]+)['"]?\)/g)
      if (imageMatches) {
        imageMatches.forEach(match => {
          const urlMatch = match.match(/url\(['"]?([^'")\s]+)['"]?\)/)
          if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
            assets.images.push(urlMatch[1])
          }
        })
      }
    })

    return assets
  }

  const rewriteHtml = (html, assetMap, baseUrl) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Update image sources
    const images = doc.querySelectorAll('img[src]')
    images.forEach(img => {
      const src = img.getAttribute('src')
      if (src && assetMap[src]) {
        img.setAttribute('src', assetMap[src])
      }
    })

    // Update stylesheet links
    const links = doc.querySelectorAll('link[rel="stylesheet"][href]')
    links.forEach(link => {
      const href = link.getAttribute('href')
      if (href && assetMap[href]) {
        link.setAttribute('href', assetMap[href])
      }
    })

    // Update inline styles
    const styles = doc.querySelectorAll('style')
    styles.forEach(style => {
      let cssText = style.textContent
      Object.keys(assetMap).forEach(originalUrl => {
        const localPath = assetMap[originalUrl]
        cssText = cssText.replace(
          new RegExp(`url\\(['"]?${originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\)`, 'g'),
          `url('${localPath}')`
        )
      })
      style.textContent = cssText
    })

    return doc.documentElement.outerHTML
  }

  const generateReplica = async () => {
    if (!url || !isValidUrl(url)) {
      setStatus('error')
      setProgress('Please enter a valid URL')
      return
    }

    setStatus('fetching')
    setProgress('Fetching HTML content...')
    setDownloadReady(false)
    setStats({ images: 0, stylesheets: 0, totalSize: 0 })

    try {
      // Fetch main HTML
      const response = await fetchWithCors(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status}`)
      }

      const html = await response.text()
      setProgress('Analyzing assets...')

      // Extract assets
      const assets = extractAssets(html, url)
      const totalAssets = assets.images.length + assets.stylesheets.length

      if (totalAssets === 0) {
        setProgress('No assets found, preparing download...')
      } else {
        setProgress(`Found ${totalAssets} assets. Downloading...`)
      }

      // Download assets
      const zip = new JSZip()
      const assetMap = {}
      let downloadedCount = 0
      let totalSize = 0

      // Download images
      for (const imageUrl of assets.images) {
        const asset = await downloadAsset(imageUrl, url)
        if (asset) {
          const filename = `images/${imageUrl.split('/').pop() || `image_${downloadedCount}.jpg`}`
          zip.file(filename, asset.blob)
          assetMap[imageUrl] = filename
          totalSize += asset.size
          downloadedCount++
          setProgress(`Downloaded ${downloadedCount}/${totalAssets} assets...`)
        }
      }

      // Download stylesheets
      for (const cssUrl of assets.stylesheets) {
        const asset = await downloadAsset(cssUrl, url)
        if (asset) {
          const filename = `styles/${cssUrl.split('/').pop() || `style_${downloadedCount}.css`}`
          zip.file(filename, asset.blob)
          assetMap[cssUrl] = filename
          totalSize += asset.size
          downloadedCount++
          setProgress(`Downloaded ${downloadedCount}/${totalAssets} assets...`)
        }
      }

      setProgress('Rewriting HTML paths...')

      // Rewrite HTML with local paths
      const updatedHtml = rewriteHtml(html, assetMap, url)
      zip.file('index.html', updatedHtml)

      setProgress('Creating ZIP file...')

      // Generate ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      setZipBlob(zipBlob)

      setStats({
        images: assets.images.length,
        stylesheets: assets.stylesheets.length,
        totalSize: Math.round(totalSize / 1024) // Convert to KB
      })

      setStatus('success')
      setProgress('Replica generated successfully!')
      setDownloadReady(true)

    } catch (error) {
      setStatus('error')
      setProgress(`Error: ${error.message}`)
      console.error('Replication error:', error)
    }
  }

  const downloadZip = () => {
    if (zipBlob) {
      const domain = new URL(url).hostname
      const filename = `${domain}-replica.zip`
      saveAs(zipBlob, filename)
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setProgress('')
    setDownloadReady(false)
    setZipBlob(null)
    setStats({ images: 0, stylesheets: 0, totalSize: 0 })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="flex gap-4">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              disabled={status === 'fetching'}
            />
            <button
              onClick={generateReplica}
              disabled={status === 'fetching' || !url}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
            >
              {status === 'fetching' ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  Generate Replica
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Display */}
        {status !== 'idle' && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg border ${
              status === 'error' 
                ? 'bg-red-50 border-red-200' 
                : status === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                {status === 'fetching' && <Loader className="w-5 h-5 animate-spin text-blue-600" />}
                {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                <span className={`font-medium ${
                  status === 'error' 
                    ? 'text-red-800' 
                    : status === 'success'
                    ? 'text-green-800'
                    : 'text-blue-800'
                }`}>
                  {progress}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Display */}
        {status === 'success' && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Image className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold text-gray-800">{stats.images}</div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold text-gray-800">{stats.stylesheets}</div>
              <div className="text-sm text-gray-600">Stylesheets</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Download className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold text-gray-800">{stats.totalSize}KB</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
          </div>
        )}

        {/* Download Button */}
        {downloadReady && (
          <div className="text-center mb-6">
            <button
              onClick={downloadZip}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-3 mx-auto font-medium text-lg shadow-lg hover:shadow-xl"
            >
              <Download className="w-6 h-6" />
              Download ZIP File
            </button>
          </div>
        )}

        {/* Reset Button */}
        {status !== 'idle' && (
          <div className="text-center">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}

        {/* How it Works */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">1</div>
              <div>
                <div className="font-medium text-gray-800">Fetch HTML</div>
                <div className="text-gray-600">Downloads the main webpage content</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">2</div>
              <div>
                <div className="font-medium text-gray-800">Find Assets</div>
                <div className="text-gray-600">Scans for images and stylesheets</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">3</div>
              <div>
                <div className="font-medium text-gray-800">Download</div>
                <div className="text-gray-600">Fetches all referenced assets</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">4</div>
              <div>
                <div className="font-medium text-gray-800">Package</div>
                <div className="text-gray-600">Creates a ZIP with local paths</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebsiteReplicator