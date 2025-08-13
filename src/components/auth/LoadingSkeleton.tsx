export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo and Brand Section Skeleton */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              {/* Logo skeleton with gradient */}
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 via-blue-200 to-indigo-200 rounded-2xl shadow-2xl animate-pulse"></div>
              {/* Decorative elements skeleton */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-200 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-200 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <div className="h-8 bg-gradient-to-r from-slate-200 via-blue-200 to-indigo-200 rounded-lg w-64 mx-auto mb-3 animate-pulse"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="w-24 h-1 bg-gradient-to-r from-slate-200 to-blue-200 mx-auto rounded-full animate-pulse"></div>
          </div>

          {/* Login Card Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            {/* Card Header Skeleton */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl mb-4 animate-pulse"></div>
              <div className="h-6 bg-slate-200 rounded-lg w-32 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-48 mx-auto animate-pulse"></div>
            </div>

            {/* Form Skeleton */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-14 bg-slate-200 rounded-2xl animate-pulse"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
              
              <div className="h-14 bg-gradient-to-r from-slate-200 via-blue-200 to-indigo-200 rounded-2xl animate-pulse"></div>
              
              <div className="text-center pt-4">
                <div className="h-3 bg-slate-200 rounded w-64 mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="text-center mt-8">
            <div className="h-3 bg-slate-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-indigo-200 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
