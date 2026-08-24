import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in — Daman Virtual" };

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-[340px]">
        <h1 className="text-center text-sm font-medium tracking-[0.18em] text-dv-white uppercase">
          Daman Virtual
        </h1>
        <p className="mt-2 text-center text-xs font-light tracking-[0.1em] text-dv-grey">
          Links dashboard
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
