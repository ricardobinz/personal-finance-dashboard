import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function Tooltip({ content, children, side = 'top', align = 'center' }) {
  const triggerRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const updatePosition = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const margin = 8
    let top = 0
    let left = 0
    if (side === 'bottom') top = rect.bottom + margin
    else if (side === 'top') top = rect.top - margin
    else top = rect.top + rect.height / 2

    if (align === 'start') left = rect.left
    else if (align === 'end') left = rect.right
    else left = rect.left + rect.width / 2

    setPos({ top, left })
  }

  const show = () => { updatePosition(); setVisible(true) }
  const hide = () => setVisible(false)

  useEffect(() => {
    if (!visible) return
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [visible])

  const tooltipNode = (
    <div
      role="tooltip"
      style={{ position: 'fixed', top: pos.top, left: pos.left, transform: align === 'center' ? 'translate(-50%, 0)' : align === 'end' ? 'translate(-100%, 0)' : 'translate(0, 0)' }}
      className={`pointer-events-none z-[1000] max-w-[18rem] rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg ${side === 'top' ? '-translate-y-full' : ''}`}
    >
      <div className="whitespace-normal break-words text-left">{content}</div>
    </div>
  )

  return (
    <span
      ref={triggerRef}
      className="inline-flex items-center"
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {mounted && visible ? createPortal(tooltipNode, document.body) : null}
    </span>
  )
}
