import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">VisitVault</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your visitor log
          </p>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}
