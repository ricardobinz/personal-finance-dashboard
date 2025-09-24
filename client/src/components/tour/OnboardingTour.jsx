import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/button.jsx'
import { useI18n } from '../../i18n/i18n.jsx'

const STORAGE_KEY = 'pf_tour_dismissed'

export default function OnboardingTour({ controls = {} }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState(null)
  const [mounted, setMounted] = useState(false)
  const rafRef = useRef(null)

  const setActiveTab = controls?.setActiveTab

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    // Auto-open if user hasn't dismissed permanently
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [])

  const steps = useMemo(() => {
    return [
      {
        selector: '#tour-app-title',
        title: t('tour.steps.intro.title'),
        body: t('tour.steps.intro.body'),
        ensure: () => setActiveTab?.('inputs'),
      },
      {
        selector: '#tour-quick-stats',
        title: t('tour.steps.quick_stats.title'),
        body: t('tour.steps.quick_stats.body'),
        ensure: () => setActiveTab?.('inputs'),
      },
      {
        selector: '#tour-tabs',
        title: t('tour.steps.tabs.title'),
        body: t('tour.steps.tabs.body'),
        ensure: () => setActiveTab?.('inputs'),
      },
      {
        selector: '#tour-assets',
        title: t('tour.steps.assets.title'),
        body: t('tour.steps.assets.body'),
        ensure: () => setActiveTab?.('inputs'),
      },
      {
        selector: '#tour-assumptions',
        title: t('tour.steps.assumptions.title'),
        body: t('tour.steps.assumptions.body'),
        ensure: () => setActiveTab?.('inputs'),
      },
      {
        selector: '#tour-incomes',
        title: t('tour.steps.incomes.title'),
        body: t('tour.steps.incomes.body'),
        ensure: () => setActiveTab?.('inputs'),
      },
      {
        selector: '#tour-expenses',
        title: t('tour.steps.expenses.title'),
        body: t('tour.steps.expenses.body'),
        ensure: () => setActiveTab?.('inputs'),
      },
      {
        selector: '#tour-income-savings',
        title: t('tour.steps.income_savings.title'),
        body: t('tour.steps.income_savings.body'),
        ensure: () => setActiveTab?.('inputs'),
      },
      {
        selector: '#tour-tabs',
        title: t('tour.steps.graphs.title'),
        body: t('tour.steps.graphs.body'),
        ensure: () => setActiveTab?.('graphs'),
      },
      {
        selector: '#tour-portfolio-allocation',
        title: t('tour.steps.portfolio_allocation.title'),
        body: t('tour.steps.portfolio_allocation.body'),
        ensure: () => setActiveTab?.('graphs'),
      },
      {
        selector: '#tour-wealth-projection',
        title: t('tour.steps.wealth_projection.title'),
        body: t('tour.steps.wealth_projection.body'),
        ensure: () => setActiveTab?.('graphs'),
      },
      {
        selector: '#tour-fi-progress',
        title: t('tour.steps.fi_progress.title'),
        body: t('tour.steps.fi_progress.body'),
        ensure: () => setActiveTab?.('graphs'),
      },
      {
        selector: '#tour-net-worth-history',
        title: t('tour.steps.net_worth_history.title'),
        body: t('tour.steps.net_worth_history.body'),
        ensure: () => setActiveTab?.('graphs'),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, setActiveTab])

  const total = steps.length
  const step = steps[index] || steps[0]

  const computeRect = () => {
    if (!open) { setRect(null); return }
    if (!step?.selector) { setRect(null); return }
    const el = document.querySelector(step.selector)
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    const padding = 8
    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      rb: r.bottom,
      rr: r.right,
    })
  }

  // Ensure correct tab and position when step changes
  useEffect(() => {
    if (!open) return
    step?.ensure?.()
    const timeout = setTimeout(() => computeRect(), 60)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, open])

  // Keep position on resize/scroll
  useEffect(() => {
    if (!open) return
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(computeRect)
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    computeRect()
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index])

  const close = () => setOpen(false)
  const skip = () => setOpen(false)
  const never = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    setOpen(false)
  }
  const next = () => setIndex((i) => Math.min(total - 1, i + 1))
  const prev = () => setIndex((i) => Math.max(0, i - 1))

  if (!mounted || !open) return null

  const cardWidth = 360
  // Default tooltip position: below target, clamped to viewport
  const tooltipStyle = (() => {
    const vpW = window.innerWidth
    const vpH = window.innerHeight
    const margin = 12
    if (!rect) {
      return { top: Math.min(100, vpH - 180), left: Math.max(16, (vpW - cardWidth) / 2) }
    }
    let top = rect.rb + margin
    let left = Math.min(Math.max(rect.cx - cardWidth / 2, margin), vpW - cardWidth - margin)
    // If not enough space below, place above
    if (top + 200 > vpH) {
      top = Math.max(rect.top - 200 - margin, margin)
    }
    return { top, left }
  })()

  const Highlight = () => (
    <div
      aria-hidden="true"
      className="fixed z-[2000] pointer-events-none"
      style={{
        top: rect?.top ?? 0,
        left: rect?.left ?? 0,
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
        borderRadius: 8,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
        transition: 'all 120ms ease',
      }}
    />
  )

  const node = (
    <div className="fixed inset-0 z-[1999]">
      {/* Clicking outside does nothing but keep overlay on top */}
      {rect && <Highlight />}

      {/* Tooltip/Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed z-[2001] w-[360px] max-w-[92vw] rounded-lg border border-gray-200 bg-white shadow-xl"
        style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="text-sm font-semibold text-gray-900">{step?.title}</div>
        </div>
        <div className="p-4 text-sm text-gray-700 whitespace-pre-line">
          {step?.body}
        </div>
        <div className="p-3 border-t border-gray-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={skip}>{t('tour.cta.skip')}</Button>
            <Button variant="ghost" size="sm" onClick={never}>{t('tour.cta.never')}</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prev} disabled={index === 0}>{t('tour.cta.back')}</Button>
            {index < total - 1 ? (
              <Button size="sm" onClick={next}>{t('tour.cta.next')}</Button>
            ) : (
              <Button size="sm" onClick={close}>{t('tour.cta.done')}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return mounted ? createPortal(node, document.body) : null
}
