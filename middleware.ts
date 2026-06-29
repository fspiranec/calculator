import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return response;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const protectedPath = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/dashboard');
  if (protectedPath && !data.user) return NextResponse.redirect(new URL('/login', request.url));
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && data.user) return NextResponse.redirect(new URL('/dashboard', request.url));
  return response;
}

export const config = { matcher: ['/', '/dashboard/:path*', '/login', '/signup'] };
