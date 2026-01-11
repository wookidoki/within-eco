import { useEffect, useState } from 'react'
import { useAuthStore, useGameStore } from '../../../stores'
import { authApi } from '../../../api/auth'
import logger from '../../../utils/logger'
import { Spinner } from '../../common'

/**
 * OAuth 콜백 핸들러 컴포넌트
 * Google 로그인 후 리다이렉트되어 토큰 처리
 */
const AuthCallback = () => {
  const [status, setStatus] = useState('processing') // processing | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const { loginSuccess, setError, setLoading } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      // URL에서 에러 체크
      const urlParams = new URLSearchParams(window.location.search)
      const authError = urlParams.get('auth_error')

      if (authError) {
        console.error('[AuthCallback] OAuth error:', authError)
        setStatus('error')
        setErrorMessage(getErrorMessage(authError))
        logger.auth.loginError({ message: authError })

        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
        return
      }

      try {
        setLoading(true)
        console.log('[AuthCallback] Processing OAuth callback...')

        // URL 파라미터에서 token과 user 추출
        const { user, token } = await authApi.handleCallback()

        console.log('[AuthCallback] Login successful:', user.name)

        // 스토어에 저장
        loginSuccess(user, { access_token: token })
        setStatus('success')

        // 성공 로그
        logger.auth.loginSuccess(user)

        // 클라우드에서 게임 데이터 불러오기 시도
        try {
          const cloudData = await authApi.loadAllData()

          if (cloudData.gameData) {
            console.log('[AuthCallback] Cloud data loaded')
            logger.auth.loadSuccess()
          }
        } catch (loadError) {
          console.log('[AuthCallback] No cloud data found, starting fresh')
        }

        // 홈으로 리다이렉트
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)

      } catch (error) {
        console.error('[AuthCallback] Error:', error)
        setStatus('error')
        setErrorMessage(error.message || '로그인에 실패했습니다')
        setError(error.message)
        logger.auth.loginError(error)

        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }
    }

    handleCallback()
  }, [loginSuccess, setError, setLoading])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0B101A',
      color: '#fff',
      gap: '20px',
    }}>
      {status === 'processing' && (
        <>
          <Spinner />
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            로그인 처리 중...
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '48px' }}>✅</div>
          <p style={{ color: '#00FF94', fontSize: '18px', fontWeight: '600' }}>
            로그인 성공!
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            잠시 후 이동합니다...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '48px' }}>❌</div>
          <p style={{ color: '#FF2A6D', fontSize: '18px', fontWeight: '600' }}>
            로그인 실패
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            {errorMessage}
          </p>
        </>
      )}
    </div>
  )
}

/**
 * 에러 코드를 사용자 친화적 메시지로 변환
 */
function getErrorMessage(errorCode) {
  const messages = {
    'access_denied': 'Google 로그인이 취소되었습니다',
    'no_code': '인증 코드가 없습니다',
    'token_exchange_failed': '토큰 교환에 실패했습니다',
    'server_error': '서버 오류가 발생했습니다',
  }
  return messages[errorCode] || `로그인 오류: ${errorCode}`
}

export default AuthCallback
