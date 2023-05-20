import { z } from 'zod';
import { useEffect, useRef } from 'react';
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { type V2_MetaFunction, json, type ActionArgs } from '@remix-run/node';
import type { Tweet } from '@prisma/client';
import { db } from '~/utils/db.server';
import { getUserId } from '~/utils/session.server';

let formDataSchema = z.object({
  tweet: z
    .string()
    .min(1, 'Your tweet must contain at least 1 character.')
    .max(280, 'Your tweet must be less than 280 characters.'),
});

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Twitter clone' }];
};

export async function loader() {
  let tweets = await db.tweet.findMany();

  return json({ tweets });
}

export async function action({ request }: ActionArgs) {
  let userId = await getUserId(request);
  let formData = await request.formData();

  if (!userId) {
    return null;
  }

  if (request.method === 'DELETE') {
    let id = formData.get('id');

    await db.tweet.delete({
      where: {
        id: Number(id),
      },
    });

    return null;
  }

  let result = formDataSchema.safeParse({ tweet: formData.get('tweet') });

  if (!result.success) {
    return result.error.flatten();
  }

  await db.tweet.create({
    data: {
      authorId: userId,
      text: result.data.tweet,
    },
  });

  return null;
}

export default function Index() {
  let formRef = useRef<HTMLFormElement>(null);
  let error = useActionData<typeof action>();
  let { tweets } = useLoaderData<typeof loader>();
  let navigation = useNavigation();

  let isSubmitting =
    navigation.state === 'submitting' && navigation.formMethod === 'POST';

  useEffect(() => {
    if (!isSubmitting) {
      formRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <div>
      <Form
        method="POST"
        action="/logout"
        className="flex items-center justify-between"
      >
        <h1 className="mb-4 text-3xl font-medium">Home page</h1>
        <button type="submit">Logout</button>
      </Form>

      <Form
        ref={formRef}
        method="POST"
        className="space-y-2 border-b pb-4 dark:border-gray-700"
      >
        <textarea
          id="tweet"
          name="tweet"
          placeholder="What's up?"
          className="w-full rounded-lg border px-4 py-2 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg px-4 py-2 text-white transition-colors dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:opacity-50"
          disabled={isSubmitting}
        >
          Tweet
        </button>

        {error &&
          error.fieldErrors.tweet?.map((err) => (
            <p key={err} className="text-sm dark:text-red-200">
              {err}
            </p>
          ))}
      </Form>

      <ul className="mt-4 space-y-2">
        {tweets.length === 0 ? (
          <p>No tweets yet.</p>
        ) : (
          // @ts-expect-error
          tweets.map((tweet) => <TweetItem tweet={tweet} key={tweet.id} />)
        )}
      </ul>
    </div>
  );
}

function TweetItem({ tweet }: { tweet: Tweet }) {
  let fetcher = useFetcher();
  let isDeleting = fetcher.formData?.get('id') === String(tweet.id);

  return (
    <li hidden={isDeleting}>
      <fetcher.Form
        method="DELETE"
        key={tweet.id}
        className="flex justify-between rounded-lg p-2"
      >
        <input type="hidden" name="id" value={tweet.id} />
        <p>{tweet.text}</p>
        <button
          type="submit"
          aria-label="Delete"
          className="disabled:opacity-50"
        >
          ❌
        </button>
      </fetcher.Form>
    </li>
  );
}
