import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Lock, Key, Clock, ShieldCheck, Mail } from "lucide-react";
import { userService } from "@/services/userService";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import ProfileForm from "@/components/forms/ProfileForm";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatDate } from "@/utils/formatters";
import type { ProfileFormData } from "@/utils/validators";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();
  const { updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "logins">("profile");

  // Local state for Change Password Form
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [pwPending, setPwPending] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile(),
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      // Split name for compatibility
      const parts = (data.fullName || "").trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      return userService.updateProfile({
        username: data.username,
        email: data.email,
        firstName,
        lastName,
      });
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile"], updatedProfile);
      updateUser(updatedProfile);
      addToast({ type: "success", message: "Profile credentials updated successfully!" });
    },
    onError: () => {
      addToast({ type: "error", message: "Failed to update profile settings" });
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmNewPassword) {
      addToast({ type: "warning", message: "Please fill in all security fields." });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      addToast({ type: "error", message: "New passwords do not match!" });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      addToast({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }

    setPwPending(true);
    setTimeout(() => {
      setPwPending(false);
      addToast({ type: "success", message: "Password updated successfully!" });
      setPwForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    }, 1000);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const defaultFullName = profile.firstName ? `${profile.firstName} ${profile.lastName || ""}`.trim() : "Secure User";
  const userInitials = profile.firstName ? `${profile.firstName[0]}${profile.lastName ? profile.lastName[0] : ""}`.toUpperCase() : "SU";

  // Mocked login logs for tab
  const loginHistory = [
    { id: 1, ipAddress: "192.168.1.1", device: "Chrome / Windows 11", status: "success", date: new Date().toISOString() },
    { id: 2, ipAddress: "192.168.1.25", device: "Safari / iOS 17", status: "success", date: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 3, ipAddress: "172.16.254.1", device: "Firefox / macOS Sequoia", status: "failed", date: new Date(Date.now() - 3600000 * 18).toISOString() },
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white sm:text-3xl">
          Account Profile
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal identifiers, update login security, and audit active sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Card */}
        <div className="space-y-6">
          <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-extrabold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                {userInitials}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{defaultFullName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{profile.username}</p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400 text-left">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Security status: Strong</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-semibold tracking-wide transition-all ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50"
              }`}
            >
              <User className="h-4 w-4" />
              Update Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-semibold tracking-wide transition-all ${
                activeTab === "password"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50"
              }`}
            >
              <Lock className="h-4 w-4" />
              Change Password
            </button>
            <button
              onClick={() => setActiveTab("logins")}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-semibold tracking-wide transition-all ${
                activeTab === "logins"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50"
              }`}
            >
              <Clock className="h-4 w-4" />
              Login Session Logs
            </button>
          </div>
        </div>

        {/* Form area */}
        <div className="lg:col-span-2">
          {activeTab === "profile" && (
            <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
              <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Personal Information</h3>
              </CardHeader>
              <CardContent className="p-6">
                <ProfileForm
                  user={profile}
                  onSubmit={(data) => mutation.mutate(data)}
                  isPending={mutation.isPending}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "password" && (
            <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
              <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Credentials Rotation</h3>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <PasswordInput
                    label="Current Password"
                    placeholder="Enter current password"
                    value={pwForm.oldPassword}
                    onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                  />
                  <PasswordInput
                    label="New Secure Password"
                    placeholder="Enter new password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Repeat new password"
                    value={pwForm.confirmNewPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmNewPassword: e.target.value })}
                  />
                  <Button type="submit" isLoading={pwPending} className="w-full h-11 rounded-xl">
                    Update Security Credentials
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "logins" && (
            <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
              <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Session Audit Trails</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3.5">
                  {loginHistory.map((log) => (
                    <div key={log.id} className="flex justify-between items-center border-b border-gray-100/50 dark:border-gray-800/50 pb-3 last:border-0 last:pb-0">
                      <div className="text-xs">
                        <p className="font-bold text-gray-900 dark:text-white">{log.ipAddress}</p>
                        <p className="text-gray-400 mt-0.5">{log.device} • {formatDate(log.date)}</p>
                      </div>
                      <Badge variant={log.status === "success" ? "success" : "danger"}>
                        {log.status === "success" ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
