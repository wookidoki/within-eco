import { useState, useEffect, useCallback } from 'react'
import { FiX } from 'react-icons/fi'
import { setToastCallback } from '../../../utils/logger'
import {
  ToastContainer,
  ToastItem,
  ToastIcon,
  ToastMessage,
  CloseButton,
} from './Toast.styles'

// 타입별 이모지
const getEmoji = (type) => {
  switch (type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'warning': return '⚠️'
    case 'info':
    default: return 'ℹ️'
  }
}

/**
 * Toast 알림 컴포넌트
 * logger 유틸리티와 연동되어 알림 표시
 */
const Toast = () => {
  const [toasts, setToasts] = useState([])

  /**
   * 토스트 추가
   */
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()

    setToasts((prev) => [...prev, { ...toast, id, isExiting: false }])

    // 4초 후 자동 제거
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
      )

      // 애니메이션 후 완전 제거
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, 4000)
  }, [])

  /**
   * 토스트 수동 제거
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    )

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  // Logger에 콜백 등록
  useEffect(() => {
    setToastCallback(addToast)
    return () => setToastCallback(null)
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          $type={toast.type}
          $isExiting={toast.isExiting}
        >
          <ToastIcon>{getEmoji(toast.type)}</ToastIcon>
          <ToastMessage>{toast.message}</ToastMessage>
          <CloseButton onClick={() => removeToast(toast.id)}>
            <FiX size={16} />
          </CloseButton>
        </ToastItem>
      ))}
    </ToastContainer>
  )
}

export default Toast
