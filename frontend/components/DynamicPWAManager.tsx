'use client'

import dynamic from 'next/dynamic'

// Dynamically import PWAManager with no SSR
const PWAManager = dynamic(() => import('./PWAManager'), {
  ssr: false,
  loading: () => null // No loading state needed for PWA manager
})

export default function DynamicPWAManager() {
  return <PWAManager />
}
