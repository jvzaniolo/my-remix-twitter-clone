import { Link, NavLink, Outlet } from '@remix-run/react';

let linkClassName = (isActive: boolean) =>
  `px-4 py-2 rounded-full dark:hover:bg-gray-800 ${
    isActive ? 'text-white font-bold' : 'text-gray-200'
  }`;

export default function Layout() {
  return (
    <>
      <div className="grid min-h-screen grid-cols-[auto,1fr] dark:bg-gray-950 dark:text-white">
        <nav className="flex w-80 flex-col gap-3 px-4 dark:bg-gray-900">
          <h1 className="px-4 py-2 text-2xl">Twitter Clone</h1>
          <NavLink to="/" className={({ isActive }) => linkClassName(isActive)}>
            Home
          </NavLink>
          <NavLink
            to="/profile/1"
            className={({ isActive }) => linkClassName(isActive)}
            prefetch="intent"
          >
            Profile
          </NavLink>
        </nav>
        <main className="w-full max-w-screen-md px-4">
          <Outlet />
        </main>
      </div>

      <div className="fixed bottom-0 h-14 w-full bg-blue-700 text-white">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </>
  );
}
