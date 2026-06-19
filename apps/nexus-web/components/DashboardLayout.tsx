import Navigation from '../components/Navigation'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div>
        <Navigation />
        <main>{children}</main>
      </div>
    </div>
  )
}
