import React, { useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore.js'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import MobileNav from './MobileNav.jsx'

export default function Layout() {
  const { user, fetchUser } = useAuthStore()
  const location = useLocation()

  // 首次进入尝试拉用户
  useEffect(() => { if (!user) fetchUser() }, [])

  // 路径变化时滚动到顶
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
