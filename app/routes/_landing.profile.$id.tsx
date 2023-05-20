import { json, redirect, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';

export async function loader({ params }: LoaderArgs) {
  let id = params.id;

  if (!id) {
    return redirect('/');
  }

  let user = await db.user.findFirst({
    where: {
      id: Number(id),
    },
  });

  return json({ user });
}

export default function Profile() {
  let { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Profile</h1>

      <p>{JSON.stringify(user, null, 2)}</p>
    </div>
  );
}
