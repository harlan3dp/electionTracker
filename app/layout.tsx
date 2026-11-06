import type { Metadata } from 'next'
import '../src/styles.css'
export const metadata: Metadata = {
  title: 'Tally · New Zealand Election 2026',
  icons: { icon: '/favicon.svg' },
  description: 'Independent New Zealand election coverage. Validated preliminary counts, local races and clear source timestamps. No invented results.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-NZ"><body>{children}</body></html>
}
