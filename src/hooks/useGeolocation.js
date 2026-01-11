import { useState, useEffect } from 'react'

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported')
      setLoading(false)
      return
    }

    const handleSuccess = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      })
      setLoading(false)
    }

    const handleError = (err) => {
      setError(err.message)
      setLoading(false)
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)
  }, [])

  return { location, error, loading }
}

export default useGeolocation
