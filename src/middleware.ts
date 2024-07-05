import { auth } from '@/auth';
import {
    AUTH_ROUTES,
    DEFAULT_AUTH_REDIRECT,
    DEFAULT_LOGIN_REDIRECT,
    PROTECTED_ROUTE,
    PUBLIC_ROUTES,
} from '@/lib/constants';

export default auth((req) => {
    const { nextUrl } = req;

    const isLoggedIn: boolean = !!req.auth;

    const isPublicRoute: boolean = PUBLIC_ROUTES.includes(nextUrl.pathname);
    const isAuthRoute: boolean = AUTH_ROUTES.includes(nextUrl.pathname);
    const isProtectedRoute: boolean =
        nextUrl.pathname.startsWith(PROTECTED_ROUTE);

    if (isPublicRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }

        return Response.redirect(new URL(DEFAULT_AUTH_REDIRECT, nextUrl));
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
    }

    if (!isLoggedIn && isProtectedRoute) {
        return Response.redirect(new URL(DEFAULT_AUTH_REDIRECT, nextUrl));
    }
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
