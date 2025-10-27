import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
const protectedRoutes = ['/swapportal'];
const publicRoutes = [
	'/login',
	'/signup',
	'/forgot-password',
	'/reset-password',
	'/',
];

export default async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.includes(path);
	const isPublicRoute = publicRoutes.includes(path);
	const session = (await cookies()).get('authTokens')?.value;

	// Redirect unauthenticated users from protected routes
	// if (isProtectedRoute && !session) {
	//   return NextResponse.redirect(new URL("/login", req.nextUrl));
	// }

	// if (!isPublicRoute && !session) {
	//   return NextResponse.redirect(new URL("/login", req.nextUrl));
	// }
	// // Redirect authenticated users from public routes
	// if (isPublicRoute && session) {
	//   return NextResponse.redirect(new URL("/swapportal", req.nextUrl));
	// }

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
