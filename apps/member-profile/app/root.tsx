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
import { Toast, Text, Title } from '@oyster/ui'; // Import UI components
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
    description: `Your home for all things ColorStack administration. Manage applications, events and more!`,
    title: 'Admin Dashboard',
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

// ✅ App comes first
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

// Error UI Component for reusability
function ErrorUI({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Title level="1" className="text-4xl font-bold text-gray-800 mb-4">
        {title}
      </Title>
      <Text className="text-lg text-gray-600 mb-6">{message}</Text>
      <a
        href="/"
        className="text-blue-600 hover:underline text-base font-medium"
      >
        Go back to Home
      </a>
    </div>
  );
}

// Export ErrorBoundary to handle errors
export function ErrorBoundary() {
  const error = useRouteError();
  const { env, toast } = useLoaderData<typeof loader>(); // Reuse loader data

  // Handle route errors (e.g., 404, 500, etc.)
  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
          <title>{error.status} - Error</title>
        </head>
        <body>
          <ErrorUI
            title={error.status.toString()}
            message={error.statusText || "Something went wrong."}
          />

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

  // Handle unexpected errors (e.g., JavaScript errors)
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <title>Unexpected Error</title>
      </head>
      <body>
        <ErrorUI
          title="Oops! Something broke."
          message="We’re sorry, an unexpected error occurred."
        />

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
