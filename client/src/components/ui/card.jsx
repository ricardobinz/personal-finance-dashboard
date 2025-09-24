import React from 'react'

export function Card({ className = '', children, ...props }) {
  return <div {...props} className={`rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}>{children}</div>
}

export function CardHeader({ className = '', children, ...props }) {
  return <div {...props} className={`p-4 border-b border-gray-200 rounded-t-lg bg-gradient-to-r from-gray-50 to-transparent ${className}`}>{children}</div>
}

export function CardTitle({ className = '', children, ...props }) {
  return <h3 {...props} className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

export function CardContent({ className = '', children, ...props }) {
  return <div {...props} className={`p-4 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children, ...props }) {
  return <div {...props} className={`p-4 border-t border-gray-200 ${className}`}>{children}</div>
}

export function CardDescription({ className = '', children, ...props }) {
  return <p {...props} className={`text-sm text-gray-600 ${className}`}>{children}</p>
}
