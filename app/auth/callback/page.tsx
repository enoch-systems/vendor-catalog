'use client'

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold">Auth callback disabled</p>
        <p className="text-gray-600">
          External OAuth login is not configured in this build.
        </p>
      </div>
    </div>
  )
}
