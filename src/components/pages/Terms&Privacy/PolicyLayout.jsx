export default function PolicyLayout({ title, updatedAt, children }) {
  return (
    <main className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-10">
          {/* Header */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {title}
          </h1>

          {updatedAt && (
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {updatedAt}
            </p>
          )}

          <hr className="my-8 border-gray-200" />

          {/* Content */}
          <div className="space-y-8 text-gray-700 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
