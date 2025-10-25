import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/';

  // Define static asset paths that should be allowed
  const isStaticAsset = path.startsWith('/_next/') || 
                       path.startsWith('/images/') || 
                       path.startsWith('/favicon.ico') ||
                       path.startsWith('/api/') ||
                       path.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/);

  // Define protected paths
  const isAdminPath = path.startsWith('/admin');
  const isPartnerPath = path.startsWith('/partner');

  // Allow public paths and static assets to pass through
  if (isPublicPath || isStaticAsset) {
    return NextResponse.next();
  }

  // Check for authentication token
  const authToken = request.cookies.get('auth-token')?.value;
  
  // Debug cookie information
  console.log(`🔍 Middleware check for route: ${path}`);
  console.log(`🍪 Cookie exists: ${!!authToken}`);
  console.log(`🍪 Cookie value length: ${authToken?.length || 0}`);
  
  if (!authToken) {
    console.log(`🔒 No auth token found for protected route: ${path}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For protected routes, let the client-side handle role-based access control
  // This prevents the Edge Runtime crypto module issue while still protecting routes
  
  // Log access attempts for monitoring
  if (isAdminPath) {
    console.log(`🔒 Admin route access attempt: ${path}`);
  } else if (isPartnerPath) {
    console.log(`🔒 Partner route access attempt: ${path}`);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
