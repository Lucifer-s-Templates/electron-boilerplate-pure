import { extname } from 'path'
import {
  fileTypeMap,
  fileTypeFilters
} from '../../shared/fileTypeConfig.js'

export { fileTypeMap, fileTypeFilters }

// 获取文件类型
export function getFileType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return fileTypeMap[ext] || ''
}
