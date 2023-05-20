import { z } from 'zod';
import { Form } from '@remix-run/react';
import { type ActionArgs, type LoaderArgs, redirect } from '@remix-run/node';
import { createUserSession, getUserId, login } from '~/utils/session.server';

let loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loader({ request }: LoaderArgs) {
  let userId = await getUserId(request);

  if (userId) {
    return redirect('/');
  }

  return null;
}

export async function action({ request }: ActionArgs) {
  let formData = await request.formData();
  let result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return { error: result.error.flatten(), user: null };
  }

  let user = await login(result.data);

  if (!user) {
    return {
      error: {
        formError: 'Invalid email or password',
        fieldErrors: {
          email: null,
          password: null,
        },
      },
      user: null,
    };
  }

  return createUserSession(user.id, '/');
}

export default function Login() {
  return (
    <div>
      <h1>Login</h1>

      <Form method="POST">
        <input type="email" name="email" />
        <input type="password" name="password" />

        <button type="submit">Login</button>
      </Form>
    </div>
  );
}
