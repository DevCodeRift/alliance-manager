import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-6">
          Alliance Manager
        </h1>
        <p className="text-2xl text-blue-100 mb-8">
          Powerful tools to manage your Politics and War alliance
        </p>
        <div className="space-y-4 text-lg text-blue-200 mb-12">
          <p>View all alliance members and their stats</p>
          <p>Sort by city count, military strength, or alliance role</p>
          <p>Real-time data from the Politics and War API</p>
        </div>
        <Link
          href="/auth/signin"
          className="inline-block bg-white text-blue-900 font-bold py-4 px-8 rounded-lg text-xl hover:bg-blue-50 transition-colors shadow-lg"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
