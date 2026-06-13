import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Loading from './components/ui/Loading.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Naming = lazy(() => import('./pages/Naming.jsx'))
const Result = lazy(() => import('./pages/Result.jsx'))
const NameDetail = lazy(() => import('./pages/NameDetail.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const User = lazy(() => import('./pages/User.jsx'))
const UserRecords = lazy(() => import('./pages/UserRecords.jsx'))
const Order = lazy(() => import('./pages/Order.jsx'))
const Articles = lazy(() => import('./pages/Articles.jsx'))
const ArticleDetail = lazy(() => import('./pages/ArticleDetail.jsx'))
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))
const AdminUsers = lazy(() => import('./pages/AdminUsers.jsx'))
const AdminCodes = lazy(() => import('./pages/AdminCodes.jsx'))
const AdminRecords = lazy(() => import('./pages/AdminRecords.jsx'))
const AdminArticles = lazy(() => import('./pages/AdminArticles.jsx'))
const AdminConfigs = lazy(() => import('./pages/AdminConfigs.jsx'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'))

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<Loading />}><Login /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<Loading />}><Register /></Suspense>} />
      <Route path="/admin/login" element={<Suspense fallback={<Loading />}><AdminLogin /></Suspense>} />
      <Route element={<Suspense fallback={<Loading />}><AdminLayout /></Suspense>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/codes" element={<AdminCodes />} />
        <Route path="/admin/records" element={<AdminRecords />} />
        <Route path="/admin/articles" element={<Suspense fallback={<Loading />}><AdminArticles /></Suspense>} />
        <Route path="/admin/configs" element={<AdminConfigs />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<Suspense fallback={<Loading />}><Home /></Suspense>} />
        <Route path="/naming" element={<Suspense fallback={<Loading />}><Naming /></Suspense>} />
        <Route path="/result" element={<Suspense fallback={<Loading />}><Result /></Suspense>} />
        <Route path="/name/:id" element={<Suspense fallback={<Loading />}><NameDetail /></Suspense>} />
        <Route path="/user" element={<Suspense fallback={<Loading />}><User /></Suspense>} />
        <Route path="/user/records" element={<Suspense fallback={<Loading />}><UserRecords /></Suspense>} />
        <Route path="/order/:orderId" element={<Suspense fallback={<Loading />}><Order /></Suspense>} />
        <Route path="/articles" element={<Suspense fallback={<Loading />}><Articles /></Suspense>} />
        <Route path="/article/:id" element={<Suspense fallback={<Loading />}><ArticleDetail /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
