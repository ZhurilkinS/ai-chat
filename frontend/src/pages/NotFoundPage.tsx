import { Link } from 'react-router'

export const NotFoundPage = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6">
        <div className="w-20 h-20 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-400/30">
          <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-7xl md:text-9xl font-bold text-white mb-4">404</h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-8">Page not found</p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl text-blue-200 hover:bg-blue-500/30 hover:text-white transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go back home
        </Link>
      </div>
    </div>
  )
}
