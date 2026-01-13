import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design System - Tend',
  robots: 'noindex, nofollow',
}

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
