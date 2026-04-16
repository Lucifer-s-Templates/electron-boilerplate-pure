/**
 * Passive Event Listeners Polyfill
 * 解决 Chrome 控制台的 passive 事件监听器警告
 * 让滚动相关事件默认使用 passive 模式，提高页面滚动性能
 */

export function initPassiveEventsPolyfill() {
  try {
    const passiveEvents = ['wheel', 'mousewheel', 'touchstart', 'touchmove', 'scroll']
    const originalAddEventListener = EventTarget.prototype.addEventListener

    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (passiveEvents.includes(type)) {
        if (typeof options === 'boolean') {
          options = { capture: options, passive: true }
        } else if (typeof options === 'object' && options !== null) {
          options = { ...options, passive: true }
        } else {
          options = { passive: true }
        }
      }
      return originalAddEventListener.call(this, type, listener, options)
    }

    console.log('[Passive Events] Polyfill initialized')
  } catch (e) {
    console.warn('[Passive Events] Polyfill failed:', e)
  }
}
