import React from 'react'

export function Card({ className = '', children }) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>
}

export function CardHeader({ className = '', children }) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

export function CardContent({ className = '', children }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children }) {
  return <div className={`p-4 border-t ${className}`}>{children}</div>
}
