import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ROLES = ["owner", "manager", "editor", "staff"];

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing authorization" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await callerClient.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: "Invalid session" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: callerStaff, error: callerStaffErr } = await adminClient
    .from("staff")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (callerStaffErr || callerStaff?.role !== "owner") {
    return json({ error: "Only owners can add staff members" }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = typeof body.role === "string" ? body.role : "";

  if (!email || !password || !name || !role) {
    return json({ error: "Email, password, name, and role are required" }, 400);
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return json({ error: "Invalid role" }, 400);
  }
  if (password.length < 8) {
    return json({ error: "Password must be at least 8 characters" }, 400);
  }

  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr || !created?.user) {
    return json({ error: createErr?.message ?? "Could not create user" }, 400);
  }

  const { data: staffRow, error: insertErr } = await adminClient
    .from("staff")
    .insert({ id: created.user.id, name, role })
    .select("id, name, role, created_at")
    .single();

  if (insertErr) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ error: insertErr.message }, 400);
  }

  return json({ staff: staffRow }, 200);
});
