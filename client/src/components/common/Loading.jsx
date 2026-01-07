export default function Loading({ fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-sela-orange border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500">載入中...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
}
