"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Implement password reset logic
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
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
          <h1 className="text-white text-3xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-gray-400 text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-brown rounded-2xl p-8 shadow-xl border border-[#454545]">
          {success ? (
            // Success Message
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-approval-color/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-approval-color"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm mb-6">
                We've sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <Link
                href="/auth/signin"
                className="block w-full bg-p2 hover:bg-p1 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors shadow-lg hover:shadow-xl"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Error Display */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3 bg-error-color/10 border border-error-color rounded-lg flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5 text-error-color"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v4m0 4h.01M10.29 3.86l-8.46 14.66A2 2 0 003.54 21h16.92a2 2 0 001.71-3.48L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  <p className="text-error-color text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Email Input Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="block w-full px-4 py-3 bg-[#202020] rounded-[10px] leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-p3 focus:border-transparent text-white border border-[#454545] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-p2 hover:bg-p1 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              {/* Additional Info */}
              <p className="text-center text-xs text-gray-400 mt-6">
                Remember your password?{" "}
                <Link
                  href="/auth/signin"
                  className="text-p3 hover:text-p2 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
