// src/components/pages/NotFound.jsx
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-6">Page not found.</p>
      <a href="/home" className="text-blue-500 underline">Back to Home</a>
    </div>
  );
}
