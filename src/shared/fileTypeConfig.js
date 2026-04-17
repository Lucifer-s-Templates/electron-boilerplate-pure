// 文件类型共享配置
// 此文件被主进程和渲染进程共享，修改一处即可生效

// 图片类型
export const imageTypeMap = {
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.bmp': 'image',
  '.webp': 'image'
}

// 视频类型
export const videoTypeMap = {
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

// 音频类型
export const audioTypeMap = {
  '.mp3': 'audio',
  '.wav': 'audio',
  '.wmv': 'audio',
  '.wma': 'audio'
}

// 压缩文件类型
export const zipTypeMap = {
  '.zip': 'application/zip',
  '.rar': 'application/zip',
  '.7z': 'application/zip'
}

// 幻灯片类型
export const pptTypeMap = {
  '.ppt': 'ppt',
  '.pptx': 'ppt'
}

// PDF类型
export const pdfTypeMap = {
  '.pdf': 'pdf'
}

// 文档类型
export const docTypeMap = {
  '.doc': 'docx',
  '.docx': 'docx',
  '.wps': 'wps'
}

// 电子表格类型
export const xlsTypeMap = {
  '.xls': 'xlsx',
  '.xlsx': 'xlsx'
}

// 文本类型
export const txtTypeMap = {
  '.txt': 'text'
}

// 完整的文件类型映射
export const fileTypeMap = {
  ...imageTypeMap,
  ...videoTypeMap,
  ...audioTypeMap,
  ...zipTypeMap,
  ...pptTypeMap,
  ...pdfTypeMap,
  ...docTypeMap,
  ...xlsTypeMap,
  ...txtTypeMap
}

// 获取扩展名列表（不包含.）
const getExtensions = typeMap => Object.keys(typeMap).map(key => key.slice(1))

// 文件类型分组
export const fileTypeGroups = {
  image: getExtensions(imageTypeMap),
  video: getExtensions(videoTypeMap),
  audio: getExtensions(audioTypeMap),
  document: getExtensions({ ...pdfTypeMap, ...docTypeMap, ...xlsTypeMap, ...txtTypeMap }),
  archive: getExtensions(zipTypeMap)
}

// 文件类型过滤器配置（用于主进程对话框）
export const fileTypeFilters = {
  all: { name: '所有文件', extensions: ['*'] },
  image: { name: '图片', extensions: fileTypeGroups.image },
  video: { name: '视频', extensions: fileTypeGroups.video },
  audio: { name: '音频', extensions: fileTypeGroups.audio },
  document: {
    name: '文档',
    extensions: fileTypeGroups.document
  },
  archive: { name: '压缩文件', extensions: fileTypeGroups.archive }
}
