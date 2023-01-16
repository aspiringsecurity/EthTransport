import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <main className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <nav className="flex flex-row items-center px-4 py-2 space-x-8">
        <div className="font-extrabold text-2xl text-gradient">⁂</div>
        <Link className="font-bold text-gradient-with-hover" href="/">create</Link>
        <Link className="font-bold text-gradient-with-hover" href="/notes">list</Link>
      </nav>
      {children}
    </main>
  )
}