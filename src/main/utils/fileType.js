import { extname } from 'path'

// 根据移动端现有逻辑，返回对应文件类型
// 图片
const imageTypeMap = {
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.bmp': 'image',
  '.webp': 'image'
}

// 视频
const videoTypeMap = {
  '.mp4': 'video',
  '.avi': 'video',
  '.mov': 'video',
  '.wmv': 'video',
  '.flv': 'video',
  '.mkv': 'video',
  '.rmvb': 'video',
  '.m2v': 'video',
  '.m3u8': 'video'
}

// 音频
const audioTypeMap = {
  '.mp3': 'audio',
  '.wav': 'audio',
  '.wmv': 'audio',
  '.wma': 'audio'
}

// 压缩文件
const zipTypeMap = {
  '.zip': 'application/zip',
  '.rar': 'application/zip',
  '.7z': 'application/zip'
}

// 幻灯片
const pptTypeMap = {
  '.ppt': 'ppt',
  '.pptx': 'ppt'
}

// 扫描件
const pdfTypeMap = {
  '.pdf': 'pdf'
}

// 文档
const docTypeMap = {
  '.doc': 'docx',
  '.docx': 'docx',
  '.wps': 'wps'
}

// 电子表格
const xlsTypeMap = {
  '.xls': 'xlsx',
  '.xlsx': 'xlsx'
}

// txt
const txtTypeMap = {
  '.txt': 'text'
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
