import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Shield, AlertTriangle, Bell, Eye, EyeOff, Moon, Sun, Trash } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const logout = useLogout();
  const { theme, toggleTheme, addToast } = useUiStore();

  // Notification Preferences State
  const [notify, setNotify] = useState({
    loginAlerts: true,
    weeklyDigest: false,
    mfaReminders: true,
  });

  // Security Preferences State
  const [security, setSecurity] = useState({
    enforceMfa: false,
    useLocalCsprng: true,
    autoClearClipboard: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmedText, setDeleteConfirmedText] = useState("");

  const handleSaveNotify = () => {
    addToast({ type: "success", message: "Notification preferences saved successfully!" });
  };

  const handleSaveSecurity = () => {
    addToast({ type: "success", message: "Security preferences updated!" });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmedText !== "DELETE") {
      addToast({ type: "error", message: "Type 'DELETE' to confirm account deletion." });
      return;
    }
    addToast({ type: "success", message: "Account deletion request initiated." });
    setDeleteModalOpen(false);
    logout.mutate();
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white sm:text-3xl">
          System Settings
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Configure interface options, notification channels, and active security rules.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Theme Preferences */}
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
            <div className="flex items-center gap-3">
              {theme === "light" ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-blue-500" />}
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Theme & UI Preferences</h3>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              <span className="font-semibold text-gray-900 dark:text-white">Interface Mode</span>
              <p className="mt-0.5">Toggle between SentinelPass high-contrast dark theme and light theme.</p>
            </div>
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="h-10 px-4 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800"
            >
              Toggle to {theme === "light" ? "Dark Mode" : "Light Mode"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Notifications Channels</h3>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notify.loginAlerts}
                  onChange={() => setNotify({ ...notify, loginAlerts: !notify.loginAlerts })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900 dark:text-white">Security Login Alerts</span>
                  <p className="text-[10px] text-gray-400">Receive email notifications immediately for any new login sessions.</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notify.weeklyDigest}
                  onChange={() => setNotify({ ...notify, weeklyDigest: !notify.weeklyDigest })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900 dark:text-white">Weekly Security Digest</span>
                  <p className="text-[10px] text-gray-400">Receive a weekly summary report of all credential evaluations.</p>
                </div>
              </label>
            </div>
            <Button onClick={handleSaveNotify} className="h-9 px-4 text-xs font-semibold rounded-xl mt-2">
              Save Channels
            </Button>
          </CardContent>
        </Card>

        {/* Security Preferences Card */}
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">System Security Rules</h3>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={security.enforceMfa}
                  onChange={() => setSecurity({ ...security, enforceMfa: !security.enforceMfa })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900 dark:text-white">Enforce Multi-Factor Authentication (MFA)</span>
                  <p className="text-[10px] text-gray-400">Simulate periodic OTP challenge queries for profile access.</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={security.useLocalCsprng}
                  onChange={() => setSecurity({ ...security, useLocalCsprng: !security.useLocalCsprng })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900 dark:text-white">Enable Client-Side CSPRNG fallbacks</span>
                  <p className="text-[10px] text-gray-400">Always calculate cryptographic entropy within web browser context.</p>
                </div>
              </label>
            </div>
            <Button onClick={handleSaveSecurity} className="h-9 px-4 text-xs font-semibold rounded-xl mt-2">
              Save Security Rules
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-950 bg-red-500/5">
          <CardHeader className="border-b border-red-200/50 p-5 dark:border-red-950/50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
              <h3 className="text-base font-bold text-red-900 dark:text-red-400">Danger Zone</h3>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              <span className="font-semibold text-gray-900 dark:text-white">Delete Profile Account</span>
              <p className="mt-0.5">Permanently delete your registered user records. This action is irreversible.</p>
            </div>
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              className="h-10 px-4 rounded-xl text-xs font-semibold"
            >
              <Trash className="h-4 w-4 mr-1.5" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-500 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-lg font-bold">Irreversible Operation</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal mb-4">
              All credentials data logs, profile settings, and evaluation logs will be permanently deleted.
              Type <b className="text-red-600 font-mono">DELETE</b> below to confirm account deletion.
            </p>
            <input
              type="text"
              placeholder="Type DELETE here..."
              value={deleteConfirmedText}
              onChange={(e) => setDeleteConfirmedText(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white/50 px-3 text-xs placeholder:text-gray-400 focus:border-red-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900/50 mb-4"
            />
            <div className="flex justify-end gap-2.5">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmedText("");
                }}
                className="h-9 px-4 rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                className="h-9 px-4 rounded-xl text-xs font-semibold"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
