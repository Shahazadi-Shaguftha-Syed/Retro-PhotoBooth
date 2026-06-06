import { useRef, useEffect, useState } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let stream = null
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setReady(true)
        }
      } catch {
        setError(true)
      }
    }
    start()
    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return { videoRef, ready, error }
}