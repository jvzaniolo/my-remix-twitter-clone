import { json, redirect, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { getUserId } from '~/utils/session.server';

export async function loader({ request, params }: LoaderArgs) {
  let userId = await getUserId(request);

  if (!userId) {
    throw redirect('/login');
  }

  let id = params.id;

  if (Number(id) !== userId) {
    throw redirect('/404');
  }

  let user = await db.user.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (!user) {
    throw redirect('/404');
  }

  return json({ user });
}

export default function Profile() {
  let user = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Profile</h1>

      <p>{JSON.stringify(user, null, 2)}</p>
    </div>
  );
}
