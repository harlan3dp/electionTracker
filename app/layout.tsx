import type { Metadata } from 'next'
import '../src/styles.css'
export const metadata: Metadata = {
  title: 'NZ Election Tracker · 2026',
  description: 'Independent New Zealand election coverage. Validated preliminary counts, local races and clear source timestamps. No invented results.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-NZ"><body>{children}</body></html>
}
