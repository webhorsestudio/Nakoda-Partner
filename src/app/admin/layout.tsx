"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { useAutoFetch } from "@/contexts/AutoFetchContext";
import { verifyJWTTokenClient, verifySimpleToken, debugToken } from "@/utils/authUtils";
import { getUserRole, getNavigationItems, UserRole } from "@/utils/roleUtils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Get auto-fetch status from context - always call hooks at top level
  const { isAutoFetchEnabled, countdown } = useAutoFetch();

  // Handle hydration mismatch - always call this hook
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication and permissions - always call this hook
  useEffect(() => {
    const checkAuth = async () => {
      if (!isClient) return;
      
      try {
        // Check for JWT token in localStorage
        const token = localStorage.getItem('auth-token');
        console.log('🔐 Admin layout checking authentication...');
        console.log('Token found:', token ? 'Yes' : 'No');
        
        if (token) {
          console.log('Token length:', token.length);
          console.log('Token preview:', token.substring(0, 20) + '...');
          
          // Debug token in development
          debugToken(token);
          
          // Validate token format before attempting verification
          if (token.trim() === '') {
            console.error('❌ Empty token found');
            localStorage.removeItem('auth-token');
            router.push('/login');
            return;
          }
          
          // Try JWT verification first
          let decoded = verifyJWTTokenClient(token);
          
          // If JWT verification fails, try simple token verification only if it's not a JWT
          if (!decoded && !token.includes('.')) {
            console.log('JWT verification failed, trying simple token verification...');
            decoded = verifySimpleToken(token);
          }
          
          console.log('Token verification result:', decoded);
          
          if (decoded) {
            console.log('✅ Authentication successful:', decoded);
            setIsAuthenticated(true);
            
            // Get user role from mobile number (since we use mobile for OTP login)
            try {
              if (decoded.mobile) {
                const role = await getUserRole(decoded.mobile);
                if (role) {
                  setUserRole(role);
                  console.log('🔑 User role:', role);
                  
                  // Check if user is actually an admin - if not, redirect to appropriate page
                  if (role.role !== 'admin') {
                    console.log('❌ User is not an admin, redirecting to appropriate page');
                    if (role.role === 'partner') {
                      router.push('/partner');
                      return;
                    } else {
                      router.push('/login');
                      return;
                    }
                  }
                } else {
                  console.log('❌ Failed to get user role');
                  router.push('/login');
                  return;
                }
              } else if (decoded.phone) {
                // Fallback to phone if mobile not found
                const role = await getUserRole(decoded.phone);
                if (role) {
                  setUserRole(role);
                  console.log('🔑 User role:', role);
                  
                  // Check if user is actually an admin - if not, redirect to appropriate page
                  if (role.role !== 'admin') {
                    console.log('❌ User is not an admin, redirecting to appropriate page');
                    if (role.role === 'partner') {
                      router.push('/partner');
                      return;
                    } else {
                      router.push('/login');
                      return;
                    }
                  }
                } else {
                  console.log('❌ Failed to get user role');
                  router.push('/login');
                  return;
                }
              } else {
                console.log('❌ No mobile/phone found in token');
                // Redirect to login if we can't determine role
                router.push('/login');
                return;
              }
              
              setIsLoading(false);
              return;
            } catch (roleError) {
              console.error('Error getting user role:', roleError);
              // Redirect to login on error instead of setting default admin role
              router.push('/login');
              return;
            }
          } else {
            console.log('❌ Invalid token, clearing and redirecting');
            localStorage.removeItem('auth-token');
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
            setIsAuthenticated(false);
            setUserRole(null);
            setIsLoading(false);
            router.push('/login');
            return;
          }
        } else {
          console.log('❌ No token found, redirecting to login');
        }
        
        // If we reach here, authentication failed
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
        router.push('/login');
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
        // Clear any invalid tokens
        localStorage.removeItem('auth-token');
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        router.push('/login');
      }
    };

    checkAuth();
  }, [isClient, router]);

  // Additional role check to ensure only admins can access admin pages - always call this hook
  useEffect(() => {
    if (userRole && userRole.role !== 'admin') {
      console.log('❌ Non-admin user trying to access admin page, redirecting');
      if (userRole.role === 'partner') {
        router.push('/partner');
      } else {
        router.push('/login');
      }
    }
  }, [userRole, router]);

  // Only apply admin layout to admin routes - check this after hooks
  if (!pathname.startsWith('/admin')) {
    console.log('🚫 Not an admin route, skipping admin layout for:', pathname);
    return <>{children}</>;
  }

  console.log('✅ Admin route detected, applying admin layout for:', pathname);

  const handleLogout = () => {
    // Clear JWT token from both localStorage and cookie
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    setIsAuthenticated(false);
    setUserRole(null);
    router.push('/login');
  };

  // Get navigation based on user role
  const navigation = getNavigationItems(userRole);

  // Show loading state during hydration, authentication check, or if not authenticated
  if (!isClient || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="flex">
            <div className="w-64 h-screen bg-gray-200"></div>
            <div className="flex-1 p-6">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while redirecting non-admin users
  if (userRole && userRole.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to appropriate page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Nakoda Partner</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href));
              // Map icon names to actual icon components
              const IconComponent = {
                'HomeIcon': HomeIcon,
                'CalendarIcon': CalendarIcon,
                'UsersIcon': UsersIcon,
                'UserGroupIcon': UserGroupIcon,
                'CurrencyDollarIcon': CurrencyDollarIcon,
                'ChartBarIcon': ChartBarIcon,
                'CogIcon': CogIcon,
                'PhotoIcon': PhotoIcon
              }[item.icon] || HomeIcon;
              
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                  
                  {/* Render sub-menu items */}
                  {item.children && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        const ChildIconComponent = {
                          'HomeIcon': HomeIcon,
                          'CalendarIcon': CalendarIcon,
                          'UsersIcon': UsersIcon,
                          'UserGroupIcon': UserGroupIcon,
                          'CurrencyDollarIcon': CurrencyDollarIcon,
                          'ChartBarIcon': ChartBarIcon,
                          'CogIcon': CogIcon,
                'PhotoIcon': PhotoIcon
                        }[child.icon] || HomeIcon;
                        
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                              isChildActive
                                ? 'bg-blue-50 text-blue-800 border-l-2 border-blue-300'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <ChildIconComponent className="mr-3 h-4 w-4" />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Nakoda Partner</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href));
              // Map icon names to actual icon components
              const IconComponent = {
                'HomeIcon': HomeIcon,
                'CalendarIcon': CalendarIcon,
                'UsersIcon': UsersIcon,
                'UserGroupIcon': UserGroupIcon,
                'CurrencyDollarIcon': CurrencyDollarIcon,
                'ChartBarIcon': ChartBarIcon,
                'CogIcon': CogIcon,
                'PhotoIcon': PhotoIcon
              }[item.icon] || HomeIcon;
              
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                  
                  {/* Render sub-menu items */}
                  {item.children && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        const ChildIconComponent = {
                          'HomeIcon': HomeIcon,
                          'CalendarIcon': CalendarIcon,
                          'UsersIcon': UsersIcon,
                          'UserGroupIcon': UserGroupIcon,
                          'CurrencyDollarIcon': CurrencyDollarIcon,
                          'ChartBarIcon': ChartBarIcon,
                          'CogIcon': CogIcon,
                'PhotoIcon': PhotoIcon
                        }[child.icon] || HomeIcon;
                        
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                              isChildActive
                                ? 'bg-blue-50 text-blue-800 border-l-2 border-blue-300'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                          >
                            <ChildIconComponent className="mr-3 h-4 w-4" />
                            <span className="text-xs">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Auto-fetch status indicator */}
              {isAutoFetchEnabled && (
                <div className="flex items-center gap-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <ClockIcon className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    Auto-sync: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <UserCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
