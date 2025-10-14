import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Know Your Sustainability Journey',
  description: 'Discover your sustainability profile through an AI-powered interview',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://webfonts.fontstand.com/WF-096640-bf6132adf35b33a3a33a7be0366458e0.css" type="text/css"/>
      </head>
      <body className="font-arizona">{children}</body>
    </html>
  )
}