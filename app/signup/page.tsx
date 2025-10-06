"use client";

import { useContext, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { signupWithPassword } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = async () => {
    const ok = await signupWithPassword(email, password);
    if (ok) router.push("/");
    else alert("Signup failed");
  };

  return (
    <div className="max-w-md mx-auto mt-10 card p-6">
      <h1 className="text-2xl font-bold mb-4">Sign up</h1>
      <div className="space-y-3">
        <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="btn btn-primary w-full" onClick={submit}>Create Account</button>
        <p className="text-sm text-center">Already have an account? <Link className="text-brand" href="/login">Login</Link></p>
      </div>
    </div>
  );
}


