import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

// Loader to test different error scenarios
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  if (type === 'unexpected') {
    throw new Error('This is an unexpected error for testing!');
  }

  if (type === '404') {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }

  return json({ message: 'Test error route' });
};

// Component to trigger errors via UI
export default function TestError() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Test ErrorBoundary</h1>
      <p>{data.message}</p>
      <div className="mt-4 space-y-2">
        <p>Test different error scenarios:</p>
        <a
          href="/test-error?type=unexpected"
          className="block text-blue-600 hover:underline"
        >
          Trigger Unexpected Error
        </a>
        <a
          href="/test-error?type=404"
          className="block text-blue-600 hover:underline"
        >
          Trigger 404 Error
        </a>
      </div>
    </div>
  );
}
