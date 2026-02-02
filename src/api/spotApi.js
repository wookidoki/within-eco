/**
 * 스팟 관련 API 서비스
 * 댓글, 사진, 좋아요 기능 제공
 */
import apiClient from './client'

/**
 * 스팟 댓글 목록 조회
 */
export const getSpotComments = async (spotId, page = 1) => {
  try {
    const { data } = await apiClient.get(`/api/spots/${spotId}/comments`, {
      params: { page, limit: 20 }
    })
    return data
  } catch (error) {
    console.error('[SpotAPI] Get comments error:', error)
    return { comments: [], total: 0 }
  }
}

/**
 * 스팟 댓글 작성
 */
export const addSpotComment = async (spotId, content) => {
  try {
    const { data } = await apiClient.post(`/api/spots/${spotId}/comments`, { content })
    return data
  } catch (error) {
    console.error('[SpotAPI] Add comment error:', error)
    throw new Error(error.response?.data?.error || '댓글 작성에 실패했습니다')
  }
}

/**
 * 스팟 댓글 삭제
 */
export const deleteSpotComment = async (spotId, commentId) => {
  try {
    await apiClient.delete(`/api/spots/${spotId}/comments/${commentId}`)
    return { success: true }
  } catch (error) {
    console.error('[SpotAPI] Delete comment error:', error)
    throw new Error(error.response?.data?.error || '댓글 삭제에 실패했습니다')
  }
}

/**
 * 스팟 사진 목록 조회
 */
export const getSpotPhotos = async (spotId) => {
  try {
    const { data } = await apiClient.get(`/api/spots/${spotId}/photos`)
    return data.photos || []
  } catch (error) {
    console.error('[SpotAPI] Get photos error:', error)
    return []
  }
}

/**
 * 스팟 사진 업로드
 */
export const uploadSpotPhoto = async (spotId, file, caption = '') => {
  try {
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('caption', caption)

    // axios가 FormData의 Content-Type을 자동 설정 (boundary 포함)
    const { data } = await apiClient.post(`/api/spots/${spotId}/photos`, formData)
    return data
  } catch (error) {
    console.error('[SpotAPI] Upload photo error:', error)
    throw new Error(error.response?.data?.error || '사진 업로드에 실패했습니다')
  }
}

/**
 * 스팟 좋아요 토글
 */
export const toggleSpotLike = async (spotId) => {
  try {
    const { data } = await apiClient.post(`/api/spots/${spotId}/like`)
    return data
  } catch (error) {
    console.error('[SpotAPI] Toggle like error:', error)
    throw new Error(error.response?.data?.error || '좋아요 처리에 실패했습니다')
  }
}

/**
 * 스팟 통계 조회
 */
export const getSpotStats = async (spotId) => {
  try {
    const { data } = await apiClient.get(`/api/spots/${spotId}/stats`)
    return data
  } catch (error) {
    console.error('[SpotAPI] Get stats error:', error)
    return { comments: 0, photos: 0, likes: 0, visits: 0 }
  }
}

export default {
  getSpotComments,
  addSpotComment,
  deleteSpotComment,
  getSpotPhotos,
  uploadSpotPhoto,
  toggleSpotLike,
  getSpotStats,
}
