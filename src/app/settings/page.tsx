"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Users,
  Lock,
  Bell,
  Palette,
  Globe,
  Battery,
  CreditCard,
  Crown,
  HelpCircle,
  MessageSquare,
  Send,
  Share2,
  BookOpen,
  FileText,
  Scale,
  Award,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  AlertTriangle,
  Trash2,
  Flag,
  Loader2,
  ArrowLeft,
  Search,
  Rocket,
  UserX,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  userSettings?: UserSettings | null;
}

interface UserStats {
  booksInLibrary: number;
  reviewsWritten: number;
  commentsPosted: number;
}

interface UserSettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
  twoFactorVerifiedAt: Date | null;
  theme: string | null;
  appLanguage: string | null;
  bookLanguages: string[];
  notificationsEnabled: boolean;
  newBookReleases: boolean;
  commentsOnBooks: boolean;
  newFollowers: boolean;
  readingReminders: boolean;
  bookRecommendations: boolean;
  showMatureContent: boolean;
  personalizedRecommendations: boolean;
  downloadOverWifiOnly: boolean;
  autoDownloadChapters: boolean;
  powerSavingMode: boolean;
  reduceAnimations: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type SettingSection =
  | "account-security"
  | "account-sharing"
  | "blocked-accounts"
  | "theme"
  | "language"
  | "notification"
  | "content-preferences"
  | "data-usage"
  | "battery-usage"
  | "payment-method"
  | "membership"
  | "help-center"
  | "report"
  | "feedback"
  | "social-media"
  | "about"
  | "terms"
  | "privacy"
  | "code-of-conduct"
  | "content-guidelines"
  | "licenses";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<SettingSection>("account-security");
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Detail view states
  const [detailView, setDetailView] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile();
    }
  }, [session?.user?.id]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const [profileResponse, settingsResponse] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/settings"),
      ]);

      if (profileResponse.ok) {
        const data = await profileResponse.json();
        setUserProfile(data.profile);
        setUserStats(data.stats);
        if (data.profile?.userSettings) {
          setUserSettings(data.profile.userSettings);
        }
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.settings) {
          setUserSettings(settingsData.settings);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setUserSettings(data.settings);
        return data.settings;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#181818]">
        <Loader2 className="w-8 h-8 text-[#9d6db8] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const menuItems = [
    {
      category: "ACCOUNT",
      items: [
        {
          id: "account-security" as const,
          label: "Account & Security",
          icon: User,
        },
        {
          id: "account-sharing" as const,
          label: "Account Sharing",
          icon: Users,
        },
        {
          id: "blocked-accounts" as const,
          label: "Blocked Accounts",
          icon: Lock,
        },
      ],
    },
    {
      category: "APP",
      items: [
        { id: "theme" as const, label: "Theme", icon: Rocket },
        { id: "language" as const, label: "Language", icon: Globe },
        { id: "notification" as const, label: "Notification", icon: Bell },
        {
          id: "content-preferences" as const,
          label: "Content Preferences",
          icon: BookOpen,
        },
        {
          id: "data-usage" as const,
          label: "Data Usage Settings",
          icon: Share2,
        },
        {
          id: "battery-usage" as const,
          label: "Battery Usage Settings",
          icon: Battery,
        },
      ],
    },
    {
      category: "PAYMENT & MEMBERSHIP",
      items: [
        {
          id: "payment-method" as const,
          label: "Payment Method",
          icon: CreditCard,
        },
        { id: "membership" as const, label: "Membership", icon: Crown },
      ],
    },
    {
      category: "CONTACT US",
      items: [
        { id: "help-center" as const, label: "Help Center", icon: HelpCircle },
        { id: "report" as const, label: "Report", icon: Flag },
        { id: "feedback" as const, label: "Feedback", icon: MessageSquare },
        { id: "social-media" as const, label: "Social Media", icon: Send },
      ],
    },
    {
      category: "ABOUT US",
      items: [
        { id: "about" as const, label: "About LarLar Books", icon: BookOpen },
        { id: "terms" as const, label: "Terms of Use", icon: FileText },
        { id: "privacy" as const, label: "Privacy Policy", icon: Shield },
        {
          id: "code-of-conduct" as const,
          label: "Code of Conduct",
          icon: Award,
        },
        {
          id: "content-guidelines" as const,
          label: "Content Guidelines",
          icon: Scale,
        },
        { id: "licenses" as const, label: "Licenses", icon: FileText },
      ],
    },
  ];

  const handleBackAndRefresh = async () => {
    setDetailView(null);
    await fetchUserProfile();
  };

  const renderContent = () => {
    // Handle detail views first
    if (detailView === "email") {
      return (
        <EmailDetailView profile={userProfile} onBack={handleBackAndRefresh} />
      );
    }
    if (detailView === "username") {
      return (
        <UsernameDetailView
          profile={userProfile}
          onBack={handleBackAndRefresh}
        />
      );
    }
    if (detailView === "phone") {
      return (
        <PhoneDetailView profile={userProfile} onBack={handleBackAndRefresh} />
      );
    }
    if (detailView === "security") {
      return (
        <SecurityDetailView
          onBack={() => setDetailView(null)}
          onNavigate={setDetailView}
        />
      );
    }
    if (detailView === "change-password") {
      return <ChangePasswordView onBack={() => setDetailView("security")} />;
    }
    if (detailView === "2fa") {
      return (
        <TwoFactorAuthView
          settings={userSettings}
          onBack={() => setDetailView("security")}
          onUpdate={updateSettings}
          onRefresh={fetchUserProfile}
        />
      );
    }

    // Handle section views
    switch (activeSection) {
      case "account-security":
        return (
          <AccountSecurityContent
            profile={userProfile}
            stats={userStats}
            onNavigate={setDetailView}
          />
        );
      case "account-sharing":
        return <AccountSharingContent />;
      case "blocked-accounts":
        return <BlockedAccountsContent />;
      case "theme":
        return (
          <ThemeContent settings={userSettings} onUpdate={updateSettings} />
        );
      case "language":
        return (
          <LanguageContent settings={userSettings} onUpdate={updateSettings} />
        );
      case "notification":
        return (
          <NotificationContent
            settings={userSettings}
            onUpdate={updateSettings}
          />
        );
      case "content-preferences":
        return (
          <ContentPreferencesContent
            settings={userSettings}
            onUpdate={updateSettings}
          />
        );
      case "data-usage":
        return (
          <DataUsageContent settings={userSettings} onUpdate={updateSettings} />
        );
      case "battery-usage":
        return (
          <BatteryUsageContent
            settings={userSettings}
            onUpdate={updateSettings}
          />
        );
      case "payment-method":
        return <PaymentMethodContent />;
      case "membership":
        return <MembershipContent stats={userStats} />;
      case "help-center":
        return <HelpCenterContent />;
      case "report":
        return <ReportContent />;
      case "feedback":
        return <FeedbackContent />;
      case "social-media":
        return <SocialMediaContent />;
      case "about":
        return <AboutContent />;
      case "terms":
        return <TermsContent />;
      case "privacy":
        return <PrivacyContent />;
      case "code-of-conduct":
        return <CodeOfConductContent />;
      case "content-guidelines":
        return <ContentGuidelinesContent />;
      case "licenses":
        return <LicensesContent />;
      default:
        return (
          <AccountSecurityContent
            profile={userProfile}
            stats={userStats}
            onNavigate={setDetailView}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#181818]">
      {/* Sidebar */}
      <div className="w-60 bg-[#181818] border-r border-[#1a1a1a] flex flex-col">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => router.back()}
              className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-[#eeeeee]">Settings</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9d6db8]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#211f20] text-[#eeeeee] text-sm rounded-md border border-[#1a1a1a] placeholder-[#6B7280] focus:outline-none focus:border-[#2a2a2a]"
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-3">
          {menuItems.map((section) => (
            <div key={section.category} className="mb-5">
              <h3 className="px-2 mb-2 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                {section.category}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center px-2 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? "bg-[#67377e] text-[#eeeeee]"
                          : "text-[#eeeeee] hover:bg-[#211f20]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mr-2.5 flex-shrink-0 ${
                          isActive ? "text-[#9d6db8]" : "text-[#9d6db8]"
                        }`}
                      />
                      <span className="text-left text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Log out button */}
        <div className="p-3 border-t border-[#1a1a1a]">
          <button
            onClick={() => router.push("/api/auth/signout")}
            className="w-full flex items-center px-2 py-2 text-sm text-[#eeeeee] hover:bg-[#211f20] rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2.5 text-[#9d6db8]" />
            <span className="text-xs">Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#181818]">
        <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
      </div>
    </div>
  );
}

// Helper function to mask email
function maskEmail(email: string | null): string {
  if (!email) return "lar*********@gmail.com";
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 3) {
    return `${localPart[0]}${"*".repeat(localPart.length - 1)}@${domain}`;
  }
  return `${localPart.substring(0, 3)}${"*".repeat(9)}@${domain}`;
}

// Helper function to mask phone
function maskPhone(phone: string | null): string {
  if (!phone) return "+6588****24";
  if (phone.length <= 4) return phone;
  const visibleStart = phone.substring(0, 4);
  const visibleEnd = phone.substring(phone.length - 2);
  return `${visibleStart}${"*".repeat(4)}${visibleEnd}`;
}

// Account & Security Content
function AccountSecurityContent({
  profile,
  stats,
  onNavigate,
}: {
  profile: UserProfile | null;
  stats: UserStats | null;
  onNavigate: (view: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Account & Security
        </h2>
      </div>

      <div className="space-y-2">
        {/* Email */}
        <div
          onClick={() => onNavigate("email")}
          className="group flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-[#9d6db8]" />
            <p className="text-sm font-medium text-[#eeeeee]">Email</p>
          </div>
          <p className="text-xs text-[#6B7280]">
            {maskEmail(profile?.email || null)}
          </p>
        </div>

        {/* Phone */}
        <div
          onClick={() => onNavigate("phone")}
          className="group flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-[#9d6db8]" />
            <p className="text-sm font-medium text-[#eeeeee]">Phone</p>
          </div>
          <p className="text-xs text-[#6B7280]">
            {maskPhone(profile?.phone || null)}
          </p>
        </div>

        {/* Security */}
        <div
          onClick={() => onNavigate("security")}
          className="group flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-[#9d6db8]" />
            <div>
              <p className="text-sm font-medium text-[#eeeeee]">Security</p>
            </div>
          </div>
        </div>

        {/* Deactivate Account */}
        <div className="group flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <UserX className="w-5 h-5 text-[#9d6db8]" />
            <div>
              <p className="text-sm font-medium text-[#eeeeee]">
                Deactivate Account
              </p>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="group flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#ba2f1f]/30 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <Trash2 className="w-5 h-5 text-[#ba2f1f]" />
            <div>
              <p className="text-sm font-medium text-[#ba2f1f]">
                Delete Account
              </p>
            </div>
          </div>
        </div>

        {/* Report Account */}
        <div className="group flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <Flag className="w-5 h-5 text-[#9d6db8]" />
            <div>
              <p className="text-sm font-medium text-[#eeeeee]">
                Report Account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder content components
function AccountSharingContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Account Sharing
        </h2>
        <p className="text-sm text-[#6B7280]">
          Manage who has access to your account and reading library.
        </p>
      </div>
      <div className="p-12 bg-[#221f20] rounded-lg border border-[#1a1a1a] text-center">
        <div className="w-16 h-16 bg-[#181818] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#1a1a1a]">
          <Users className="w-8 h-8 text-[#9d6db8]" />
        </div>
        <p className="text-sm text-[#6B7280]">No shared accounts yet</p>
      </div>
    </div>
  );
}

function BlockedAccountsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Blocked Accounts
        </h2>
        <p className="text-sm text-[#6B7280]">
          Manage blocked users and authors.
        </p>
      </div>
      <div className="p-12 bg-[#221f20] rounded-lg border border-[#1a1a1a] text-center">
        <div className="w-16 h-16 bg-[#181818] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#1a1a1a]">
          <Lock className="w-8 h-8 text-[#9d6db8]" />
        </div>
        <p className="text-sm text-[#6B7280]">No blocked accounts</p>
      </div>
    </div>
  );
}

function ThemeContent({
  settings,
  onUpdate,
}: {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<UserSettings>;
}) {
  const [selectedTheme, setSelectedTheme] = useState(
    settings?.theme || "Default"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleThemeChange = async (theme: string) => {
    setSelectedTheme(theme);
    setIsSaving(true);
    try {
      await onUpdate({ theme });
    } catch (error) {
      console.error("Failed to update theme:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Theme</h2>
      </div>
      <div className="space-y-2">
        {["Black", "White", "Default"].map((theme) => (
          <label
            key={theme}
            onClick={() => handleThemeChange(theme)}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
              selectedTheme === theme
                ? "bg-[#67377e] border-[#67377e]"
                : "bg-[#221f20] border-[#1a1a1a] hover:border-[#2a2a2a]"
            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-sm text-[#eeeeee]">{theme}</span>
            <input
              type="radio"
              name="theme"
              checked={selectedTheme === theme}
              onChange={() => handleThemeChange(theme)}
              disabled={isSaving}
              className="accent-[#67377e] w-4 h-4"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function LanguageContent({
  settings,
  onUpdate,
}: {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<UserSettings>;
}) {
  const [appLanguage, setAppLanguage] = useState(
    settings?.appLanguage || "English"
  );
  const [bookLanguages, setBookLanguages] = useState<string[]>(
    settings?.bookLanguages || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAppLanguageChange = async (lang: string) => {
    setAppLanguage(lang);
    setIsSaving(true);
    try {
      await onUpdate({ appLanguage: lang });
    } catch (error) {
      console.error("Failed to update app language:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookLanguageToggle = async (lang: string) => {
    const newBookLanguages = bookLanguages.includes(lang)
      ? bookLanguages.filter((l) => l !== lang)
      : [...bookLanguages, lang];
    setBookLanguages(newBookLanguages);
    setIsSaving(true);
    try {
      await onUpdate({ bookLanguages: newBookLanguages });
    } catch (error) {
      console.error("Failed to update book languages:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Language</h2>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-[#eeeeee] mb-3">
            App Language
          </h3>
          <div className="relative">
            <select
              value={appLanguage}
              onChange={(e) => handleAppLanguageChange(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e] appearance-none disabled:opacity-50"
            >
              <option value="English">English</option>
              <option value="မြန်မာ">မြန်မာ</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-5 h-5 text-[#9d6db8] pointer-events-none" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#eeeeee] mb-3">
            Book Language
          </h3>
          <div className="space-y-2">
            {["မြန်မာ", "中文", "日本語"].map((lang) => (
              <label
                key={lang}
                onClick={() => handleBookLanguageToggle(lang)}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                  bookLanguages.includes(lang)
                    ? "bg-[#67377e] border-[#67377e]"
                    : "bg-[#221f20] border-[#1a1a1a] hover:border-[#2a2a2a]"
                } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-sm text-[#eeeeee]">{lang}</span>
                <input
                  type="checkbox"
                  checked={bookLanguages.includes(lang)}
                  onChange={() => handleBookLanguageToggle(lang)}
                  disabled={isSaving}
                  className="accent-[#67377e] w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationContent({
  settings,
  onUpdate,
}: {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<UserSettings>;
}) {
  const notificationSettings = [
    {
      key: "newBookReleases" as const,
      label: "New book releases",
      value: settings?.newBookReleases ?? true,
    },
    {
      key: "commentsOnBooks" as const,
      label: "Comments on your books",
      value: settings?.commentsOnBooks ?? true,
    },
    {
      key: "newFollowers" as const,
      label: "New followers",
      value: settings?.newFollowers ?? true,
    },
    {
      key: "readingReminders" as const,
      label: "Reading reminders",
      value: settings?.readingReminders ?? true,
    },
    {
      key: "bookRecommendations" as const,
      label: "Book recommendations",
      value: settings?.bookRecommendations ?? true,
    },
  ];

  const handleToggle = async (key: keyof UserSettings, value: boolean) => {
    try {
      await onUpdate({ [key]: value });
    } catch (error) {
      console.error("Failed to update notification setting:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Notifications
        </h2>
        <p className="text-sm text-[#6B7280]">
          Manage your notification preferences
        </p>
      </div>
      <div className="space-y-2">
        {notificationSettings.map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer"
          >
            <span className="text-sm text-[#eeeeee]">{item.label}</span>
            <input
              type="checkbox"
              checked={item.value}
              onChange={(e) => handleToggle(item.key, e.target.checked)}
              className="accent-[#67377e] w-4 h-4"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function ContentPreferencesContent({
  settings,
  onUpdate,
}: {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<UserSettings>;
}) {
  const handleToggle = async (
    key: "showMatureContent" | "personalizedRecommendations",
    value: boolean
  ) => {
    try {
      await onUpdate({ [key]: value });
    } catch (error) {
      console.error("Failed to update content preference:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Content Preferences
        </h2>
        <p className="text-sm text-[#6B7280]">
          Customize your reading experience and content recommendations.
        </p>
      </div>
      <div className="space-y-2">
        <label className="flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer">
          <span className="text-sm text-[#eeeeee]">Show mature content</span>
          <input
            type="checkbox"
            checked={settings?.showMatureContent ?? false}
            onChange={(e) =>
              handleToggle("showMatureContent", e.target.checked)
            }
            className="accent-[#67377e] w-4 h-4"
          />
        </label>
        <label className="flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer">
          <span className="text-sm text-[#eeeeee]">
            Personalized recommendations
          </span>
          <input
            type="checkbox"
            checked={settings?.personalizedRecommendations ?? true}
            onChange={(e) =>
              handleToggle("personalizedRecommendations", e.target.checked)
            }
            className="accent-[#67377e] w-4 h-4"
          />
        </label>
      </div>
    </div>
  );
}

function DataUsageContent({
  settings,
  onUpdate,
}: {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<UserSettings>;
}) {
  const handleToggle = async (
    key: "downloadOverWifiOnly" | "autoDownloadChapters",
    value: boolean
  ) => {
    try {
      await onUpdate({ [key]: value });
    } catch (error) {
      console.error("Failed to update data usage setting:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Data Usage Settings
        </h2>
        <p className="text-sm text-[#6B7280]">
          Manage how the app uses your data
        </p>
      </div>
      <div className="space-y-2">
        <label className="flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer">
          <span className="text-sm text-[#eeeeee]">
            Download over Wi-Fi only
          </span>
          <input
            type="checkbox"
            checked={settings?.downloadOverWifiOnly ?? true}
            onChange={(e) =>
              handleToggle("downloadOverWifiOnly", e.target.checked)
            }
            className="accent-[#67377e] w-4 h-4"
          />
        </label>
        <label className="flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer">
          <span className="text-sm text-[#eeeeee]">
            Auto-download new chapters
          </span>
          <input
            type="checkbox"
            checked={settings?.autoDownloadChapters ?? false}
            onChange={(e) =>
              handleToggle("autoDownloadChapters", e.target.checked)
            }
            className="accent-[#67377e] w-4 h-4"
          />
        </label>
      </div>
    </div>
  );
}

function BatteryUsageContent({
  settings,
  onUpdate,
}: {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<UserSettings>;
}) {
  const powerSavingMode = settings?.powerSavingMode ?? false;
  const reduceAnimations = settings?.reduceAnimations ?? false;

  const handleToggle = async (
    key: "powerSavingMode" | "reduceAnimations",
    value: boolean
  ) => {
    try {
      await onUpdate({ [key]: value });
    } catch (error) {
      console.error("Failed to update battery setting:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Battery Usage Settings
        </h2>
      </div>
      <div className="space-y-2">
        <label className="flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer">
          <span className="text-sm text-[#eeeeee]">Power Saving Mode</span>
          <button
            type="button"
            onClick={() => handleToggle("powerSavingMode", !powerSavingMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              powerSavingMode ? "bg-[#67377e]" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                powerSavingMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer">
          <span className="text-sm text-[#eeeeee]">Reduce Animations</span>
          <button
            type="button"
            onClick={() => handleToggle("reduceAnimations", !reduceAnimations)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              reduceAnimations ? "bg-[#67377e]" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                reduceAnimations ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}

function PaymentMethodContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Payment Method
        </h2>
        <p className="text-sm text-[#6B7280]">
          Manage your payment methods for purchases.
        </p>
      </div>
      <div className="p-12 bg-[#221f20] rounded-lg border border-[#1a1a1a] text-center">
        <div className="w-16 h-16 bg-[#181818] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#1a1a1a]">
          <CreditCard className="w-8 h-8 text-[#9d6db8]" />
        </div>
        <p className="text-sm text-[#6B7280] mb-4">No payment methods added</p>
        <button className="px-6 py-2 bg-[#67377e] text-[#eeeeee] text-sm rounded-md hover:bg-[#67377e]/80 transition-colors">
          Add Payment Method
        </button>
      </div>
    </div>
  );
}

function MembershipContent({ stats }: { stats: UserStats | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Membership</h2>
        <p className="text-sm text-[#6B7280]">Manage your subscription plan</p>
      </div>
      <div className="p-6 bg-[#221f20] rounded-lg border border-[#1a1a1a]">
        <div className="flex items-center space-x-3 mb-4">
          <Crown className="w-7 h-7 text-[#9d6db8]" />
          <div>
            <h3 className="text-base font-semibold text-[#eeeeee]">
              Free Plan
            </h3>
            <p className="text-xs text-[#6B7280]">Basic access to books</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-[#181818] rounded-md border border-[#1a1a1a]">
              <p className="text-lg font-bold text-[#eeeeee]">
                {stats.booksInLibrary}
              </p>
              <p className="text-[10px] text-[#6B7280] uppercase">
                Books Owned
              </p>
            </div>
            <div className="text-center p-3 bg-[#181818] rounded-md border border-[#1a1a1a]">
              <p className="text-lg font-bold text-[#eeeeee]">
                {stats.reviewsWritten}
              </p>
              <p className="text-[10px] text-[#6B7280] uppercase">Reviews</p>
            </div>
            <div className="text-center p-3 bg-[#181818] rounded-md border border-[#1a1a1a]">
              <p className="text-lg font-bold text-[#eeeeee]">
                {stats.commentsPosted}
              </p>
              <p className="text-[10px] text-[#6B7280] uppercase">Comments</p>
            </div>
          </div>
        )}

        <button className="w-full px-6 py-2.5 bg-[#67377e] text-[#eeeeee] text-sm rounded-md hover:bg-[#67377e]/80 transition-colors">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}

function HelpCenterContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Help Center</h2>
        <p className="text-sm text-[#6B7280]">
          Find answers to common questions and get support.
        </p>
      </div>
      <div className="space-y-2">
        {[
          "How to upload a book",
          "How to edit your profile",
          "Payment issues",
          "Account security",
          "Content guidelines",
        ].map((item) => (
          <div
            key={item}
            className="p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="text-sm text-[#eeeeee]">{item}</span>
            <ChevronRight className="w-4 h-4 text-[#9d6db8]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Report</h2>
        <p className="text-sm text-[#6B7280]">
          Report content, users, or technical issues.
        </p>
      </div>
      <textarea
        className="w-full h-32 p-4 bg-[#221f20] text-[#eeeeee] text-sm rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#2a2a2a] placeholder-[#6B7280]"
        placeholder="Describe the issue..."
      />
      <button className="px-6 py-2.5 bg-[#67377e] text-[#eeeeee] text-sm rounded-md hover:bg-[#67377e]/80 transition-colors">
        Submit Report
      </button>
    </div>
  );
}

function FeedbackContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Feedback</h2>
        <p className="text-sm text-[#6B7280]">
          We'd love to hear your thoughts and suggestions!
        </p>
      </div>
      <textarea
        className="w-full h-32 p-4 bg-[#221f20] text-[#eeeeee] text-sm rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#2a2a2a] placeholder-[#6B7280]"
        placeholder="Share your feedback..."
      />
      <button className="px-6 py-2.5 bg-[#67377e] text-[#eeeeee] text-sm rounded-md hover:bg-[#67377e]/80 transition-colors">
        Send Feedback
      </button>
    </div>
  );
}

function SocialMediaContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Social Media</h2>
        <p className="text-sm text-[#6B7280]">
          Follow us on social media for updates.
        </p>
      </div>
      <div className="space-y-2">
        {["Facebook", "Twitter", "Instagram", "TikTok"].map((platform) => (
          <div
            key={platform}
            className="p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="text-sm text-[#eeeeee]">{platform}</span>
            <ChevronRight className="w-4 h-4 text-[#9d6db8]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          About LarLar Books
        </h2>
        <p className="text-sm text-[#6B7280]">Learn more about our platform</p>
      </div>
      <div className="p-6 bg-[#221f20] rounded-lg border border-[#1a1a1a]">
        <p className="text-sm text-[#eeeeee] mb-4">
          LarLar Books is a platform for readers and writers to discover, share,
          and enjoy books in Myanmar and English languages.
        </p>
        <p className="text-xs text-[#6B7280]">Version 1.0.0</p>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Terms of Use</h2>
        <p className="text-sm text-[#6B7280]">Read our terms and conditions</p>
      </div>
      <div className="p-6 bg-[#221f20] rounded-lg border border-[#1a1a1a] text-sm text-[#eeeeee] space-y-4">
        <p>Last updated: November 23, 2025</p>
        <p>By using LarLar Books, you agree to these terms and conditions...</p>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Privacy Policy
        </h2>
        <p className="text-sm text-[#6B7280]">How we handle your data</p>
      </div>
      <div className="p-6 bg-[#221f20] rounded-lg border border-[#1a1a1a] text-sm text-[#eeeeee] space-y-4">
        <p>Last updated: November 23, 2025</p>
        <p>
          We respect your privacy and are committed to protecting your personal
          data...
        </p>
      </div>
    </div>
  );
}

function CodeOfConductContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Code of Conduct
        </h2>
        <p className="text-sm text-[#6B7280]">Community guidelines</p>
      </div>
      <div className="p-6 bg-[#221f20] rounded-lg border border-[#1a1a1a] text-sm text-[#eeeeee] space-y-4">
        <p>Our community guidelines and expected behavior for all users.</p>
      </div>
    </div>
  );
}

function ContentGuidelinesContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">
          Content Guidelines
        </h2>
        <p className="text-sm text-[#6B7280]">Publishing standards</p>
      </div>
      <div className="p-6 bg-[#221f20] rounded-lg border border-[#1a1a1a] text-sm text-[#eeeeee] space-y-4">
        <p>Guidelines for publishing and sharing content on LarLar Books.</p>
      </div>
    </div>
  );
}

function LicensesContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee] mb-1">Licenses</h2>
        <p className="text-sm text-[#6B7280]">Open source attributions</p>
      </div>
      <div className="p-6 bg-[#221f20] rounded-lg border border-[#1a1a1a] text-sm text-[#eeeeee] space-y-4">
        <p>Open source licenses and attributions.</p>
      </div>
    </div>
  );
}

// Detail View Components
function EmailDetailView({
  profile,
  onBack,
}: {
  profile: UserProfile | null;
  onBack: () => void;
}) {
  const [email, setEmail] = useState(profile?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile/email", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update email");
      }

      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#eeeeee]">Email</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-[#eeeeee] mb-2">
            Current Email
          </h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e]"
            placeholder="Enter your email"
          />
          {error && <p className="text-[#ba2f1f] text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#221f20] text-[#eeeeee] text-sm rounded-md hover:bg-[#211f20] transition-colors disabled:opacity-50 border border-[#1a1a1a]"
          >
            {isLoading ? "Saving..." : "Change Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsernameDetailView({
  profile,
  onBack,
}: {
  profile: UserProfile | null;
  onBack: () => void;
}) {
  const [username, setUsername] = useState(profile?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!username || username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update username");
      }

      onBack();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update username"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#eeeeee]">Change Username</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-[#6B7280] mb-2 block">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e]"
            placeholder="Enter your username"
          />
          {error && <p className="text-[#ba2f1f] text-sm mt-2">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-[#67377e] text-[#eeeeee] rounded-lg hover:bg-[#67377e]/80 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function PhoneDetailView({
  profile,
  onBack,
}: {
  profile: UserProfile | null;
  onBack: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!phone || phone.trim().length < 8) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile/phone", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update phone number");
      }

      onBack();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update phone number"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentPhone = profile?.phone || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#eeeeee]">Phone</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-[#eeeeee] mb-2">
            Current Phone Number
          </h3>
          <div className="flex items-center space-x-3">
            <input
              type="tel"
              value={phone || currentPhone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e]"
              placeholder="Enter your phone number"
            />
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-3 bg-[#67377e] text-[#eeeeee] text-sm rounded-md hover:bg-[#67377e]/80 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Change Number"}
            </button>
          </div>
          {error && <p className="text-[#ba2f1f] text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function SecurityDetailView({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (view: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#eeeeee]">Security</h2>
      </div>

      <div className="space-y-2">
        <div
          onClick={() => onNavigate("change-password")}
          className="group flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer"
        >
          <p className="text-sm font-medium text-[#eeeeee]">Change Password</p>
        </div>

        <div
          onClick={() => onNavigate("2fa")}
          className="group flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer"
        >
          <p className="text-sm font-medium text-[#eeeeee]">
            2 Factor Authentication
          </p>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordView({ onBack }: { onBack: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      onBack();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#eeeeee]">Change Password</h2>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-[#ba2f1f]/10 border border-[#ba2f1f]/30 rounded-lg">
            <p className="text-[#ba2f1f] text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="text-sm text-[#6B7280] mb-2 block">
            Old Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e]"
            placeholder="Enter old password"
          />
        </div>

        <div>
          <label className="text-sm text-[#6B7280] mb-2 block">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e]"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="text-sm text-[#6B7280] mb-2 block">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e]"
            placeholder="Confirm new password"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => {}}
            className="text-[#9d6db8] hover:text-[#eeeeee] text-sm transition-colors"
          >
            Forgot Password?
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#67377e] text-[#eeeeee] text-sm rounded-md hover:bg-[#67377e]/80 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TwoFactorAuthView({
  settings,
  onBack,
  onUpdate,
  onRefresh,
}: {
  settings: UserSettings | null;
  onBack: () => void;
  onUpdate: (updates: Partial<UserSettings>) => Promise<UserSettings>;
  onRefresh?: () => void;
}) {
  const [step, setStep] = useState<"choose" | "input" | "code" | "result">(
    "choose"
  );
  const [authMethod, setAuthMethod] = useState<"phone" | "email" | null>(null);
  const [contactInfo, setContactInfo] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<"success" | "failure" | null>(null);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log("2FA State changed:", { step, result, isLoading });
  }, [step, result, isLoading]);

  const handleMethodSelect = (method: "phone" | "email") => {
    setAuthMethod(method);
    setStep("input");
  };

  const handleContactSubmit = async () => {
    if (!contactInfo.trim() || !authMethod) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/settings/2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: authMethod,
          contactInfo: contactInfo.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      // Store the code to display in UI (for development/testing)
      // Only show if code is returned (means email/SMS services aren't configured)
      if (data.code) {
        setVerificationCode(data.code);
        console.log("Verification code:", data.code);
      } else {
        // Code was sent via email/SMS, don't display it
        setVerificationCode(null);
      }

      setStep("code");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleCodeSubmit = async () => {
    if (code.some((digit) => !digit)) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const codeString = code.join("");
      const response = await fetch("/api/settings/2fa", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeString,
          enabled: true,
        }),
      });

      const data = await response.json();

      console.log("2FA verification response:", {
        response: response.ok,
        data,
      });

      if (!response.ok) {
        console.error("2FA verification failed:", data);
        setError(data.error || "Failed to verify code");
        setResult("failure");
        setStep("result");
        return;
      }

      if (!data.success) {
        console.error("2FA verification unsuccessful:", data);
        setError(data.error || "Invalid verification code");
        setResult("failure");
        setStep("result");
        return;
      }

      // Set success state immediately
      console.log("Setting result to success and step to result");
      setResult("success");
      setStep("result");
      setIsLoading(false);

      // Don't refresh immediately - it causes the component to re-render and lose state
      // We'll refresh when the user clicks "Next" button instead
    } catch (err) {
      console.error("2FA verification error:", err);
      setError(err instanceof Error ? err.message : "Failed to verify code");
      setResult("failure");
      setStep("result");
      setIsLoading(false);
      console.log("Setting result to failure and step to result");
    }
  };

  // Step 1: Choose Phone or Email
  if (step === "choose") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#eeeeee]">
            2 Factor Authentication
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-[#eeeeee] text-sm">
            Choose how you want to receive your authentication code
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleMethodSelect("phone")}
              className="w-full flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#9d6db8]" />
                <span className="text-sm text-[#eeeeee]">Phone</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9d6db8]" />
            </button>
            <button
              onClick={() => handleMethodSelect("email")}
              className="w-full flex items-center justify-between p-4 bg-[#221f20] rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#9d6db8]" />
                <span className="text-sm text-[#eeeeee]">Email</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9d6db8]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Input Phone or Email
  if (step === "input") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setStep("choose")}
            className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#eeeeee]">
            2 Factor Authentication
          </h2>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-[#ba2f1f]/10 border border-[#ba2f1f]/30 rounded-lg">
              <p className="text-[#ba2f1f] text-sm">{error}</p>
            </div>
          )}
          <p className="text-[#eeeeee] text-sm">
            Number or Email for Authentication
          </p>

          <input
            type={authMethod === "phone" ? "tel" : "email"}
            value={contactInfo}
            onChange={(e) => {
              setContactInfo(e.target.value);
              setError("");
            }}
            placeholder={
              authMethod === "phone"
                ? "Enter your phone number"
                : "Enter your email"
            }
            className="w-full px-4 py-3 bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e]"
          />

          <div className="flex justify-end">
            <button
              onClick={handleContactSubmit}
              disabled={isLoading || !contactInfo.trim()}
              className="px-6 py-2.5 bg-[#67377e] text-[#eeeeee] text-sm rounded-md hover:bg-[#67377e]/80 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Enter 4-digit code
  if (step === "code") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setStep("input")}
            className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#eeeeee]">
            2 Factor Authentication
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[#eeeeee] text-sm mb-2">
              Enter the verification code sent to your{" "}
              {authMethod === "phone" ? "phone" : "email"}
            </p>
            {verificationCode && (
              <div className="p-3 bg-[#67377e]/20 border border-[#67377e]/50 rounded-lg mb-4">
                <p className="text-xs text-[#6B7280] mb-1">
                  [Development Mode] Your verification code:
                </p>
                <p className="text-2xl font-bold text-[#9d6db8] text-center">
                  {verificationCode}
                </p>
                <p className="text-xs text-[#6B7280] mt-1 text-center">
                  In production, this will be sent via{" "}
                  {authMethod === "phone" ? "SMS" : "email"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-16 h-16 text-center text-2xl font-bold bg-[#221f20] text-[#eeeeee] rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#67377e]"
              />
            ))}
            <button
              onClick={handleCodeSubmit}
              disabled={isLoading || code.some((digit) => !digit)}
              className="px-6 py-3 bg-[#67377e] text-[#eeeeee] text-sm rounded-md hover:bg-[#67377e]/80 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Show result (success or failure)
  if (step === "result") {
    console.log("Rendering result page, result:", result);
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-[#9d6db8] hover:text-[#eeeeee] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#eeeeee]">
            2 Factor Authentication
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <p className="text-[#eeeeee] text-lg">
            2 Factor Authentication was a
          </p>
          <div className="flex flex-col items-center space-y-4">
            <p
              className={`text-4xl font-bold ${
                result === "success" ? "text-[#4CAF50]" : "text-[#ba2f1f]"
              }`}
            >
              {result === "success"
                ? "Success"
                : result === "failure"
                ? "Failure"
                : "Processing..."}
            </p>
            <div
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
                result === "success"
                  ? "border-[#4CAF50]"
                  : result === "failure"
                  ? "border-[#ba2f1f]"
                  : "border-[#6B7280]"
              }`}
            >
              {result === "success" ? (
                <svg
                  className="w-12 h-12 text-[#EEEEEE]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : result === "failure" ? (
                <svg
                  className="w-12 h-12 text-[#EEEEEE]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end w-full">
            <button
              onClick={() => {
                // Refresh settings before going back
                if (onRefresh) {
                  onRefresh();
                }
                onBack();
              }}
              className="px-6 py-2.5 bg-[#221f20] text-[#eeeeee] text-sm rounded-md hover:bg-[#211f20] transition-colors border border-[#1a1a1a]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
