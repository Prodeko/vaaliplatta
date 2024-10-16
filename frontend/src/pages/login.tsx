export function LoginRedirectToOauth({ to }: { to: string }) {
    window.location.href = to
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
                    Redirecting...
                </h1>
            </div>
        </div>
    )
}