"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "OAuthSignin":
        return "Error in constructing an authorization URL.";
      case "OAuthCallback":
        return "Error in handling the response from the OAuth provider.";
      case "OAuthCreateAccount":
        return "Could not create OAuth provider user in the database.";
      case "EmailCreateAccount":
        return "Could not create email provider user in the database.";
      case "Callback":
        return "Error in the OAuth callback handler route.";
      case "OAuthAccountNotLinked":
        return "The email associated with this account is already linked to another account.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-6">
            <Image
              src="/logo.png"
              alt="LarLar Books logo"
              width={40}
              height={40}
              className="rounded-none"
            />
            <span className="font-bold text-2xl text-white">LarLar Books</span>
          </Link>
        </div>

        {/* Error Card */}
        <div className="bg-brown rounded-2xl p-8 shadow-xl border border-[#454545]">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-error-color/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-error-color"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-white text-2xl font-bold text-center mb-3">
            Authentication Error
          </h1>

          {/* Error Message */}
          <p className="text-gray-400 text-center mb-6">
            {getErrorMessage(error)}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-p2 hover:bg-p1 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full bg-[#454545] hover:bg-[#555555] text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Additional Help */}
          {error && (
            <div className="mt-6 p-4 bg-[#181818] rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Error code: <span className="font-mono text-gray-400">{error}</span>
              </p>
            </div>
          )}
        </div>

        {/* Support Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Need help?{" "}
            <Link href="/support" className="text-p3 hover:text-p2 transition-colors">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
