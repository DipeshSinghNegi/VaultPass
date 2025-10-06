"use client";

import { useContext, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { loginWithPassword } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = async () => {
    const ok = await loginWithPassword(email, password);
    if (ok) router.push("/");
    else alert("Login failed");
  };

  const useTest = async () => {
    await fetch("/api/dev/seed", { method: "POST" });
    const te = process.env.NEXT_PUBLIC_TEST_USER_EMAIL ?? "test@example.com";
    const tp = process.env.NEXT_PUBLIC_TEST_USER_PASSWORD ?? "test12345";
    setEmail(te);
    setPassword(tp);
  };

  return (
    <div className="max-w-md mx-auto mt-10 card p-6">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <div className="space-y-3">
        <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="btn btn-primary w-full" onClick={submit}>Login</button>
        <button className="btn btn-secondary w-full" onClick={useTest}>Use Test User</button>
        <p className="text-sm text-center">No account? <Link className="text-brand" href="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}


