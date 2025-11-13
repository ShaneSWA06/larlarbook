"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 mb-6"
          >
            <Image
              src="/logo.png"
              alt="LarLar Books logo"
              width={40}
              height={40}
              className="rounded-none"
            />
            <span className="font-bold text-2xl text-white">LarLar Books</span>
          </Link>
          <h1 className="text-white text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">
            Sign in to continue your reading journey
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-brown rounded-2xl p-8 shadow-xl border border-[#454545]">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-w1 hover:bg-w2 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#454545]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-brown text-gray-400">
                More options coming soon
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-error-color border border-red-400 rounded-lg flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 text-white"
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
              <p className="text-white text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Email Sign In Inputs */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
                className="block w-full px-4 py-3 bg-[#202020] rounded-[10px] leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-p3 focus:border-transparent text-white border border-[#454545] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                className="block w-full px-4 py-3 bg-[#202020] rounded-[10px] leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-p3 focus:border-transparent text-white border border-[#454545] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex items-center justify-between mt-2">
                <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-md border border-[#454545] bg-[#202020] transition-colors peer-focus:ring-2 peer-focus:ring-p3 peer-checked:bg-p3 peer-checked:border-p3">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="M5 10l3 3 7-7" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-300">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-p3 hover:text-p2 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-p2 hover:bg-p1 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Additional Info */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-p3 hover:text-p2 transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-p3 hover:text-p2 transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-p3 hover:text-p2 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
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
