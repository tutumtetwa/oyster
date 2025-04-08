import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';
import { withSentry } from '@sentry/remix';

import { buildMeta } from '@oyster/core/remix';
import { Toast } from '@oyster/ui';
import uiStylesheet from '@oyster/ui/index.css?url';

import { ENV } from '@/shared/constants.server';
import { commitSession, getSession, SESSION } from '@/shared/session.server';
import tailwindStylesheet from '@/tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: uiStylesheet },
  { rel: 'stylesheet', href: tailwindStylesheet },
];

export const meta: MetaFunction = () => {
  return buildMeta({
    description: `Your home for all things ColorStack membership. Manage your profile and more!`,
    title: 'Member Profile',
  });
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const toast = session.get(SESSION.TOAST);

  const env: Window['env'] = {
    ENVIRONMENT: ENV.ENVIRONMENT,
    SENTRY_DSN: ENV.SENTRY_DSN,
  };

  return json(
    {
      env,
      toast: toast || null,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
}

// ✅ App goes first
function App() {
  const { env, toast } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body>
        <Outlet />

        {toast && (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default withSentry(App);


export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <title>{error.status} {error.statusText}</title>
        </head>
        <body className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white text-black">
          <h1 className="text-6xl font-bold">{error.status}</h1>
          <p className="text-xl mt-2">{error.statusText}</p>
          {error.data && <p className="text-gray-600 mt-1">{error.data}</p>}
          <a href="/" className="mt-6 text-blue-600 underline">Back to Home</a>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>App Error</title>
      </head>
      <body className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white text-black">
        <h1 className="text-4xl font-bold mb-2">Something went wrong</h1>
        <p className="text-red-600">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <a href="/" className="mt-6 text-blue-600 underline">Back to Home</a>
      </body>
    </html>
  );
}
