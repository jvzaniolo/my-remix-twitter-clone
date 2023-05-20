import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { db } from './db.server';

let SECRETS = process.env.SESSION_SECRET;

let storage = createCookieSessionStorage({
  cookie: {
    name: 'twitter_clone_session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    secrets: [SECRETS],
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request) {
  let session = await getUserSession(request);

  let userId = session.get('userId');

  if (!userId || typeof userId !== 'number') {
    return null;
  }

  return userId;
}

export async function getUser(request: Request) {
  let userId = await getUserId(request);

  if (!userId) {
    return null;
  }

  try {
    let user = await db.user.findUnique({ where: { id: Number(userId) } });

    return user;
  } catch {
    throw logout(request);
  }
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  let user = await db.user.findFirst({ where: { email } });

  if (!user || user.password !== password) {
    return null;
  }

  return user;
}

export async function logout(request: Request) {
  let session = await getUserSession(request);

  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
}

export async function register({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  let user = await db.user.create({
    data: {
      email,
      password,
      name,
    },
  });

  return user;
}

export async function createUserSession(userId: number, redirectTo: string) {
  let session = await storage.getSession();

  session.set('userId', userId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
}
