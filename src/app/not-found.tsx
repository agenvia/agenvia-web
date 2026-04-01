import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
            <Shield className="h-8 w-8 text-teal-400" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-7xl font-black text-zinc-800">404</div>
          <h1 className="text-2xl font-semibold text-zinc-100">Page not found</h1>
          <p className="text-sm text-zinc-400 leading-6">
            This page does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
