import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login';

  // Define admin paths that require authentication
  const isAdminPath = path.startsWith('/admin');

  // For now, let the client-side handle authentication
  // This avoids the Edge Runtime crypto module issue
  // The admin layout will handle JWT verification and role-based access
  
  // If trying to access login page and has auth cookie, let client-side handle redirects
  if (isPublicPath) {
    const authCookie = request.cookies.get('auth-token')?.value;
    if (authCookie) {
      console.log('🔐 Auth cookie found, letting client-side handle role-based redirects');
      // Don't redirect automatically - let the login page check the role and redirect accordingly
    }
  }

  // For protected admin routes, let the client-side handle redirects
  // This prevents the redirect loop issue and allows for role-based access control
  
  // Log access attempts for monitoring
  if (isAdminPath) {
    console.log(`🔒 Admin route access attempt: ${path}`);
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
