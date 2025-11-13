"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { iconSrc: "/home.png", label: "Home", href: "/" },
  { iconSrc: "/books.png", label: "Library", href: "/library" },
  { iconSrc: "/bookMark.png", label: "Purchased Books", href: "/bookmarks" },
  { iconSrc: "/save.png", label: "Read Later", href: "/saved" },
  { iconSrc: "/add.png", label: "Add Library", href: "/add-book" },
  { iconSrc: "/profile.png", label: "Followed Authors", href: "/profile" },
  { iconSrc: "/license.png", label: "Membership", href: "/license" },
];

type SidebarProps = { expanded?: boolean };

export default function Sidebar({ expanded = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={`fixed left-0 top-20 bottom-0 bg-[#181818] text-white z-50 border-r border-[#454545] transition-all duration-300 ease-in-out ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <nav className="mt-6">
        <ul className="flex flex-col space-y-6">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <li key={index} className="w-full">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#202020] transition-colors ${
                    expanded ? "pl-6 pr-3" : "justify-center"
                  }`}
                  aria-label={item.label}
                >
                  {/* Icon with fixed size and centered */}
                  <div className="flex-shrink-0 w-[28px] h-[28px] flex items-center justify-center">
                    <Image
                      src={item.iconSrc}
                      alt={`${item.label} icon`}
                      width={24}
                      height={24}
                      className="w-[20px] h-[24px] object-contain"
                      style={{
                        // When on the Library page, force the Home icon to display white
                        filter:
                          (pathname.startsWith("/library") && item.href === "/")
                            ? "brightness(0) invert(1)"
                            : isActive
                            ? "brightness(0) saturate(100%) invert(56%) sepia(26%) saturate(1000%) hue-rotate(226deg) brightness(92%) contrast(85%)"
                            : "none",
                      }}
                    />
                  </div>

                  {/* Text with consistent font size and smooth transition */}
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      expanded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 pointer-events-none absolute"
                    } ${isActive ? "text-p3" : ""}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
