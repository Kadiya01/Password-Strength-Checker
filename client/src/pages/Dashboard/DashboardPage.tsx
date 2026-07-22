import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  ClipboardCheck,
  Cpu,
  History,
  AlertTriangle,
  Lightbulb,
  Info,
  ChevronRight
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import PageHeader from "@/components/common/PageHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils/formatters";

export default function DashboardPage() {
  const { data: stats, isLoading, refetch } = useDashboard();
  const [activeTip, setActiveTip] = useState(0);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tips = [
    {
      title: "Use Passphrases",
      desc: "Combine 4 random words (e.g. correct-horse-battery-staple) to make a password that is easy to memorize but extremely difficult for standard computer clusters to crack."
    },
    {
      title: "Avoid Sequential Strings",
      desc: "Do not use '123456', 'qwerty', or repeat sequences. Cyber attack tools utilize dictionary listings that check these variations in milliseconds."
    },
    {
      title: "Unique Credentials Only",
      desc: "Never recycle passwords across multiple personal or work accounts. If one service encounters a leak, malicious actors will test those credentials on other sites."
    }
  ];

  const currentStats = stats || {
    totalPasswordsChecked: 0,
    averageStrength: 0,
    securityScore: 0,
    strengthDistribution: { weak: 0, fair: 0, strong: 0, veryStrong: 0 },
    recentActivity: []
  };

  const dist = currentStats.strengthDistribution;
  const totalDistribution = dist.weak + dist.fair + dist.strong + dist.veryStrong || 1;
  const percentWeak = Math.round((dist.weak / totalDistribution) * 100);
  const percentFair = Math.round((dist.fair / totalDistribution) * 100);
  const percentStrong = Math.round((dist.strong / totalDistribution) * 100);
  const percentVeryStrong = Math.round((dist.veryStrong / totalDistribution) * 100);

  // SVG Gauge calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentStats.securityScore / 100) * circumference;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white sm:text-3xl">
          Security Overview
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Monitor your credential auditing statistics and inspect recent login sessions.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Evaluations Audited</span>
              <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {currentStats.totalPasswordsChecked}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
              <History className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Average Strength</span>
              <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {currentStats.averageStrength}/100
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Security Index</span>
              <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {currentStats.securityScore}%
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Audit Status</span>
              <p className="text-2xl font-extrabold text-green-500">Secure</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Widgets Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* SVG Circular Gauge & Strength Distribution */}
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80 lg:col-span-2">
          <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Cryptographic Assessment Charts</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* SVG Circle Gauge */}
              <div className="flex flex-col items-center">
                <div className="relative h-40 w-40">
                  <svg className="h-full w-full -rotate-90">
                    {/* Background Ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="stroke-gray-100 dark:stroke-gray-800"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-1000 ease-out"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      {currentStats.securityScore}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                      Overall Score
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
                  Your aggregated profile security index based on registered credentials complexity metrics.
                </p>
              </div>

              {/* Horizontal Distribution Bars */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Strength Class Distribution
                </h4>
                
                {/* Very Strong */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">Excellent (&gt;90)</span>
                    <span className="text-gray-400">{dist.veryStrong} ({percentVeryStrong}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${percentVeryStrong}%` }} />
                  </div>
                </div>

                {/* Strong */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">Strong (75-89)</span>
                    <span className="text-gray-400">{dist.strong} ({percentStrong}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentStrong}%` }} />
                  </div>
                </div>

                {/* Fair */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">Fair (45-74)</span>
                    <span className="text-gray-400">{dist.fair} ({percentFair}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentFair}%` }} />
                  </div>
                </div>

                {/* Weak */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">Weak (&lt;45)</span>
                    <span className="text-gray-400">{dist.weak} ({percentWeak}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${percentWeak}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Quick Access Modules</h3>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <Link
              to="/password-checker"
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/40 p-3.5 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20 dark:hover:bg-gray-800/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                  <ClipboardCheck className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-gray-900 dark:text-white">Strength Checker</h4>
                  <p className="text-[10px] text-gray-400">Audit your password entropy</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/password-generator"
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/40 p-3.5 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20 dark:hover:bg-gray-800/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-gray-900 dark:text-white">Secure Generator</h4>
                  <p className="text-[10px] text-gray-400">CSPRNG credential creation</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/history"
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/40 p-3.5 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20 dark:hover:bg-gray-800/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                  <History className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-gray-900 dark:text-white">Audit History Logs</h4>
                  <p className="text-[10px] text-gray-400">Inspect historical records</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs & Security Tips Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Session Audits */}
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80 lg:col-span-2">
          <CardHeader className="border-b border-gray-100/50 p-5 dark:border-gray-800/50">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Login Audit Logs</h3>
          </CardHeader>
          <CardContent className="p-5">
            {currentStats.recentActivity.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                <Activity className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                No login activities logged.
              </div>
            ) : (
              <div className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
                {currentStats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        activity.success
                          ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                          : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-left">
                        <span className="font-bold text-gray-900 dark:text-white">{activity.ipAddress}</span>
                        <p className="text-[10px] text-gray-400">{formatDate(activity.createdAt)}</p>
                      </div>
                    </div>
                    <Badge variant={activity.success ? "success" : "danger"}>
                      {activity.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips Slideshow Widget */}
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80 bg-blue-600/5 border-blue-600/10">
          <CardHeader className="p-5 flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4.5 w-4.5 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Security Tip</h3>
            </div>
            <div className="flex gap-1">
              {tips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTip(i)}
                  aria-label={`Show tip ${i + 1}`}
                  className={`h-1.5 w-1.5 rounded-full ${i === activeTip ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-700"}`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-left">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400">{tips[activeTip].title}</h4>
            <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {tips[activeTip].desc}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
