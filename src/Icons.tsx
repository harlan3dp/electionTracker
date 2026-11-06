const paths = {
  results: 'M4 19V11m5 8V5m6 14v-6m5 6V8M3 22h19',
  electorates: 'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  parties: 'M15 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3m18 0v-3a4 4 0 0 0-3-3.87M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4-3.87a4 4 0 0 1 0 7.75',
  coalitions: 'M3 20a9 9 0 0 1 18 0M7 20a5 5 0 0 1 10 0M12 3v3M4 7l2 2m14-2-2 2M2 13l3 1m17-1-3 1',
  analysis: 'M4 3v17h17M7 14l4-4 4 3 6-8m-5 0h5v5',
  sources: 'M5 3h10l4 4v14H5ZM14 3v5h5M8 12h8m-8 4h6',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM8 14h2m4 0h2m-8 4h2',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  external: 'M8 4H4v16h16v-4M13 3h8v8m0-8L10 14',
  refresh: 'M20 7v5h-5M4 17v-5h5m-4.6-3a8 8 0 0 1 13.2-4L20 8M4 16l2.4 3A8 8 0 0 0 19.6 15',
  info: 'M12 11v6m0-10v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  clock: 'M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>
}

export function TallyMark() {
  return <svg className="brand-icon" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="currentColor"/><path d="M11 12v17m6-18v17m6-16v17m6-18v17M8 25l24-11" fill="none" stroke="#f7f8f4" strokeWidth="2" strokeLinecap="round"/></svg>
}
