/**
 * Seed script: creates two admin accounts in Supabase.
 * Run once: node scripts/seed-admins.mjs
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (from Supabase Dashboard → Settings → API)
 *   -- OR --
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  (fallback, limited permissions)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vvrhiqroivdddssrvpwv.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SERVICE_KEY) {
  console.error("❌  Set SUPABASE_SERVICE_ROLE_KEY in .env first");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const admins = [
  { email: "support@studyassist.ru", password: "rodopi91", username: "support" },
  { email: "prihodkods@mail.ru",     password: "rodopi92", username: "prihodkods" },
];

async function createAdmin({ email, password, username }) {
  console.log(`\n→ Processing ${email} …`);

  // 1. Try to sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.admin
    ? await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, role: "student" },
      })
    : await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, role: "student" } },
      });

  let userId;

  if (signUpError) {
    if (signUpError.message?.includes("already registered") || signUpError.message?.includes("already been registered")) {
      // User exists — find by email in profiles
      console.log("  ℹ️  User already exists, updating profile …");
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("email", email)
        .maybeSingle();
      if (!existing) {
        console.error("  ❌  Could not find existing profile for", email);
        return;
      }
      userId = existing.user_id;
    } else {
      console.error("  ❌  signUp error:", signUpError.message);
      return;
    }
  } else {
    userId = signUpData?.user?.id;
    console.log("  ✅  Auth user created:", userId);
  }

  if (!userId) {
    console.error("  ❌  No userId obtained for", email);
    return;
  }

  // 2. Upsert profile with is_admin = true
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        email,
        username,
        role: "student",
        is_admin: true,
        bonus_balance: 0,
      },
      { onConflict: "user_id" }
    );

  if (profileError) {
    console.error("  ❌  Profile upsert error:", profileError.message);
  } else {
    console.log("  ✅  Profile upserted with is_admin = true");
  }
}

for (const admin of admins) {
  await createAdmin(admin);
}

console.log("\n🎉  Done!");
process.exit(0);
