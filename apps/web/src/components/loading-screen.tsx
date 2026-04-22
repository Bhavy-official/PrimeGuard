export const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-grid px-4">
      <div className="panel w-full max-w-md p-8 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200/20 border-t-brand-400" />
        <h1 className="mt-6 font-display text-2xl font-bold text-white">Preparing your workspace</h1>
        <p className="mt-2 text-sm text-slate-400">
          We are restoring your session and syncing your dashboard.
        </p>
      </div>
    </div>
  );
};
