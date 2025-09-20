import React from 'react'

export function Button({ className = '', variant = 'default', size = 'md', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-5 text-base',
  }
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-100',
    ghost: 'text-gray-900 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-500',
  }
  const cls = `${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`
  return <button className={cls} {...props} />
}
