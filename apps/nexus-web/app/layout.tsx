export const metadata = {
  title: 'Nexus Web',
  description: 'Nexus web application'
}

import '../styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
