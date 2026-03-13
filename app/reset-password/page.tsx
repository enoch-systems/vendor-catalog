'use client'

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Password reset disabled
        </h2>
        <p className="text-gray-600">
          This project no longer uses Supabase authentication, so password reset is not available.
        </p>
      </div>
    </div>
  )
}
