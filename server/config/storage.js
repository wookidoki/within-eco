import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const STORAGE_MODE = process.env.STORAGE_MODE || 'local'
const S3_BUCKET = process.env.S3_BUCKET
const S3_REGION = process.env.S3_REGION || 'ap-northeast-2'

let s3Client = null

if (STORAGE_MODE === 's3' && S3_BUCKET) {
  // IAM Instance Role 사용 — access key 불필요
  s3Client = new S3Client({ region: S3_REGION })
  console.log(`[Storage] S3 mode: bucket=${S3_BUCKET}, region=${S3_REGION}`)
} else {
  console.log('[Storage] Local mode')
}

// 로컬 uploads 폴더 보장
const uploadDir = path.join(__dirname, '..', 'uploads')
try { mkdirSync(uploadDir, { recursive: true }) } catch (e) {}

/**
 * 파일 업로드 처리
 * - STORAGE_MODE=s3: S3에 업로드, 실패 시 로컬 fallback
 * - STORAGE_MODE=local: 로컬 저장만
 *
 * @param {Object} file - multer file 객체 (path, filename, mimetype 등)
 * @returns {Object} { url, s3Key }
 */
export async function uploadFile(file) {
  const s3Key = `photos/${file.filename}`

  if (STORAGE_MODE === 's3' && s3Client && S3_BUCKET) {
    try {
      const fileBuffer = readFileSync(file.path)
      await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.mimetype,
      }))

      const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${s3Key}`
      console.log(`[Storage] S3 upload OK: ${s3Key}`)
      return { url, s3Key }
    } catch (err) {
      console.error(`[Storage] S3 upload failed, falling back to local:`, err.message)
      // fallback to local
      return {
        url: `/uploads/${file.filename}`,
        s3Key: null,
      }
    }
  }

  // 로컬 모드: multer가 이미 저장했으므로 경로만 반환
  return {
    url: `/uploads/${file.filename}`,
    s3Key: null,
  }
}

/**
 * 사진 URL 가져오기
 * s3_key가 있으면 S3 URL, 없으면 로컬 /uploads/ URL
 */
export function getPhotoUrl(photo) {
  if (photo.s3_key && S3_BUCKET) {
    return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${photo.s3_key}`
  }
  if (photo.url) {
    return photo.url
  }
  return `/uploads/${photo.filename}`
}

export default { uploadFile, getPhotoUrl }
