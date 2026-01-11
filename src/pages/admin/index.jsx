import { useState, useEffect } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

const AdminPage = () => {
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 저장된 세션 확인
    const savedToken = localStorage.getItem('admin_token')
    const savedAdmin = localStorage.getItem('admin_user')

    if (savedToken && savedAdmin) {
      // 토큰 유효성 검증
      fetch('/api/admin/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => {
          if (res.ok) return res.json()
          throw new Error('Invalid token')
        })
        .then(data => {
          setAdmin(data)
          setToken(savedToken)
        })
        .catch(() => {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = (adminData, tokenData) => {
    setAdmin(adminData)
    setToken(tokenData)
  }

  const handleLogout = () => {
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {})
    }

    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setAdmin(null)
    setToken(null)
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f1a',
        color: 'rgba(255,255,255,0.6)'
      }}>
        로딩 중...
      </div>
    )
  }

  if (!admin || !token) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard admin={admin} token={token} onLogout={handleLogout} />
}

export default AdminPage
