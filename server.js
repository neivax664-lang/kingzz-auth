const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const supabase = createClient(
  "https://pywcbzknqpemmngxnpub.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5d2NiemtucXBlbW1uZ3hucHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMjIwNjcsImV4cCI6MjA5MzY5ODA2N30.pxuf_CGEsmBmo3RwJEQEAk9V6ctf-vQRI8XhXhYEZ_w"
);

app.get("/", (req, res) => {
  res.send("Kingzz auth server is online");
});

app.post("/check-key", async (req, res) => {
  const key = String(req.body.key || "").trim();
  const hwid = String(req.body.hwid || "").trim();

  const { data, error } = await supabase
    .from("keys")
    .select("*")
    .eq("license_key", key)
    .single();

  if (error || !data) {
    console.log("Supabase error:", error);
    return res.json({ ok: false, message: "Invalid key" });
  }

  if (data.banned) {
    return res.json({ ok: false, message: "Key banned" });
  }

  if (new Date() > new Date(data.expires + "T23:59:59")) {
    return res.json({ ok: false, message: "Key expired" });
  }

  if (!data.hwid) {
    await supabase
      .from("keys")
      .update({ hwid })
      .eq("license_key", key);
  } else if (data.hwid !== hwid) {
    return res.json({ ok: false, message: "Locked to another PC" });
  }

  res.json({
    ok: true,
    expires: data.expires
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Kingzz auth server running");
});