import { z } from 'zod';
import { Form } from '@remix-run/react';
import { type LoaderArgs, type ActionArgs, redirect } from '@remix-run/node';
import { createUserSession, getUserId, register } from '~/utils/session.server';

let registerSchema = z.object({
  name: z.string().min(1, 'Your name must contain at least 1 character.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Your password must contain at least 8 characters.'),
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
  let result = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return result.error.flatten();
  }

  let user = await register(result.data);

  return createUserSession(user.id, '/');
}

export default function Register() {
  return (
    <div>
      <h1>Register</h1>

      <Form method="POST">
        <div>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="text" id="password" name="password" />
        </div>

        <button type="submit">Register</button>
      </Form>
    </div>
  );
}
