import { extname } from 'path'

// 图片
const imageTypeMap = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp'
}

// 视频
const videoTypeMap = {
  '.mp4': 'video/mp4',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',
  '.flv': 'video/x-flv',
  '.mkv': 'video/x-matroska',
  '.rmvb': 'application/vnd.rn-realmedia-vbr',
  '.m2v': 'video/mpeg',
  '.m3u8': 'application/vnd.apple.mpegurl'
}

// 音频
const audioTypeMap = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.wmv': 'audio/x-ms-wmv',
  '.wma': 'audio/x-ms-wma'
}

// 压缩文件
const zipTypeMap = {
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed'
}

// 幻灯片
const pptTypeMap = {
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}

// 扫描件
const pdfTypeMap = {
  '.pdf': 'application/pdf'
}

// 文档
const docTypeMap = {
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.wps': 'application/vnd.ms-works'
}

// 电子表格
const xlsTypeMap = {
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

// txt
const txtTypeMap = {
  '.txt': 'text/plain'
}

// 文件类型映射（通过后缀名）
export const fileTypeMap = {
  // 图片
  ...imageTypeMap,
  // 视频
  ...videoTypeMap,
  // 音频
  ...audioTypeMap,
  // 压缩文件
  ...zipTypeMap,
  // 幻灯片
  ...pptTypeMap,
  // 扫描件
  ...pdfTypeMap,
  // 文档
  ...docTypeMap,
  // 电子表格
  ...xlsTypeMap,
  // txt
  ...txtTypeMap
}

const getExtensions = (typeMap) => Object.keys(typeMap).map((key) => key.slice(1))

// 文件类型过滤器配置
export const fileTypeFilters = {
  all: { name: '所有文件', extensions: ['*'] },
  image: { name: '图片文件', extensions: getExtensions(imageTypeMap) },
  video: {
    name: '视频文件',
    extensions: getExtensions(videoTypeMap)
  },
  audio: { name: '音频文件', extensions: getExtensions(audioTypeMap) },
  document: {
    name: '文档文件',
    extensions: getExtensions({ ...pdfTypeMap, ...docTypeMap, ...xlsTypeMap, ...txtTypeMap })
  },
  archive: { name: '压缩文件', extensions: getExtensions(zipTypeMap) }
}

// 获取文件类型
export function getFileType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return fileTypeMap[ext] || ''
}
