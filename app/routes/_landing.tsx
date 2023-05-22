import type { LoaderArgs } from '@remix-run/node';
import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { getUserId } from '~/utils/session.server';

let linkClassName = (isActive: boolean) =>
  `px-4 py-2 rounded-full dark:hover:bg-gray-800 ${
    isActive ? 'dark:text-white font-bold' : 'dark:text-gray-200'
  }`;

export async function loader({ request }: LoaderArgs) {
  let userId = await getUserId(request);

  return userId;
}

export default function Layout() {
  let userId = useLoaderData<typeof loader>();

  return (
    <>
      <div className="grid min-h-screen grid-cols-[auto,1fr] dark:bg-gray-950 dark:text-white">
        <nav className="flex w-80 flex-col gap-3 px-4 dark:bg-gray-900">
          <h1 className="px-4 py-2 text-2xl">Twitter Clone</h1>

          <NavLink to="/" className={({ isActive }) => linkClassName(isActive)}>
            Home
          </NavLink>
          <NavLink
            to={`/profile/${userId}`}
            className={({ isActive }) => linkClassName(isActive)}
            prefetch="intent"
          >
            Profile
          </NavLink>

          <form method="post" action="/logout" className="mt-auto">
            <button type="submit" className="rounded px-4 py-2">
              Logout
            </button>
          </form>
        </nav>

        <main className="w-full max-w-screen-md px-4">
          <Outlet />
        </main>
      </div>

      {!userId && (
        <div className="fixed bottom-0 h-14 w-full bg-blue-700 text-white">
          <div className="mx-auto w-full max-w-screen-lg space-x-4 py-2">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      )}
    </>
  );
}
