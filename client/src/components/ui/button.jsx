import React from 'react'

export function Button({ className = '', variant = 'default', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2'
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    outline: 'border border-gray-300 hover:bg-gray-100',
    ghost: 'hover:bg-gray-100',
  }
  return <button className={`${base} ${variants[variant] || variants.default} ${className}`} {...props} />
}
