"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { User, LogOut, Settings, Menu } from "lucide-react";
import Image from "next/image";

type HeaderProps = {
  onToggleSidebar?: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-[#181818] text-white px-6 py-4 flex items-center justify-between">
      {/* Left side - Brand */}
      <div className="flex items-center space-x-3">
        <button
          className="p-2 rounded-md hover:bg-gray-800"
          aria-label="Open menu"
          onClick={onToggleSidebar}
        >
          <Menu className="w-6 h-6 text-p3" strokeWidth={3} />
        </button>
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="LarLar Books logo"
            width={28}
            height={28}
            className="rounded-none"
          />
          <span className="font-bold text-lg">LarLar Books</span>
        </Link>
      </div>

      {/* Center - Search Bar */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="block w-full px-4 py-3 bg-brown rounded-[10px] leading-5 placeholder-gray-400 focus:outline-none text-white"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-4">
        {/* Write Button */}
        <Link
          href="/write"
          className="flex items-center space-x-2 bg-p2 hover:bg-p1 px-4 py-2 rounded-[30px] text-white font-medium transition-colors"
        >
          <Image src="/note.png" alt="Write" width={20} height={20} />
          <span>Write</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 hover:opacity-90 transition-opacity">
          <Image src="/bell.png" alt="Notifications" width={20} height={20} />
        </button>

        {/* User Menu */}
        {session ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
            >
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-logo-purple rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400">{session.user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                <hr className="my-1 border-gray-700" />
                <button
                  onClick={() => signOut()}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/auth/signin"
              className="text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-p2 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-p1 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
