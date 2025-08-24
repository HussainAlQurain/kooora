'use client'

import { useEffect } from 'react'

export default function SWReset() {
	useEffect(() => {
		(async () => {
			try {
				if ('serviceWorker' in navigator) {
					const regs = await navigator.serviceWorker.getRegistrations()
					for (const reg of regs) {
						try { await reg.unregister() } catch {}
					}
				}
				if (window.caches && caches.keys) {
					const keys = await caches.keys()
					for (const key of keys) {
						try { await caches.delete(key) } catch {}
					}
				}
				// Force reload once after cleanup
				const flag = 'sw-reset-once'
				if (!sessionStorage.getItem(flag)) {
					sessionStorage.setItem(flag, '1')
					location.reload()
				}
			} catch (e) {
				// ignore
			}
		})()
	}, [])
	return null
}
