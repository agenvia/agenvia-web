import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#14b8a6",
              colorBackground: "#18181b",
              colorText: "#f4f4f5",
              colorTextSecondary: "#a1a1aa",
              colorInputBackground: "#27272a",
              colorInputText: "#f4f4f5",
              borderRadius: "0.75rem",
              fontFamily: "inherit",
            },
            elements: {
              card: "border border-zinc-800 bg-zinc-900 shadow-none rounded-xl",
              footer: "bg-zinc-900 border-t border-zinc-800 rounded-b-xl",
              footerActionText: "text-zinc-500 text-xs",
              headerTitle: "text-lg font-semibold text-zinc-50",
              headerSubtitle: "text-sm text-zinc-400",
              formButtonPrimary: "bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors",
              formFieldInput: "border border-zinc-700 bg-zinc-800 text-zinc-100 text-sm placeholder-zinc-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30",
              formFieldLabel: "text-xs font-medium text-zinc-400",
              footerActionLink: "text-teal-400 hover:text-teal-300",
              identityPreviewText: "text-zinc-300",
              dividerLine: "bg-zinc-700",
              dividerText: "text-zinc-500",
              socialButtonsBlockButton: "border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
              socialButtonsBlockButtonText: "text-zinc-100 text-sm",
            },
          }}
          afterSignInUrl="/client-dashboard"
          signUpUrl="/signup"
        />
      </div>
    </div>
  );
}
