// Site-wide password gate (pre-launch review). Runs on Netlify's edge before any
// page or file is served, so nothing on the site is reachable without the password.
// To take the site public: delete this file, commit, push.
const PASSWORD = "ggreview2026";
const COOKIE = "tgg_gate";
const MAX_AGE = 60 * 60 * 24 * 30; // stay signed in for 30 days

async function tokenFor(pw) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("tgg-gate:" + pw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeNext(v) {
  const s = typeof v === "string" ? v : "/";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function gatePage(next, error) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Private preview — The Geriatrician’s Guide</title>
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@500&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
html,body{min-height:100%;background:#1A2C40;color:#F5F0E6;font-family:"Source Sans 3",system-ui,sans-serif;font-size:18px;line-height:1.8}
.bar{padding:22px 32px}.rule{height:4px;background:#A85535}
.wm{display:inline-flex;flex-direction:column;width:fit-content;line-height:1}
.wm__the{font-weight:600;font-size:9px;letter-spacing:.22em;color:#C4962A}
.wm__name{font-family:Lora,Georgia,serif;font-weight:500;font-size:22px;letter-spacing:-.015em;margin-top:3px}
.wm__rule{height:2px;background:#C4962A;margin-top:6px}
main{max-width:460px;margin:0 auto;padding:96px 24px}
.eyebrow{font-weight:600;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#C4962A;margin-bottom:12px}
h1{font-family:Lora,Georgia,serif;font-weight:500;font-size:34px;line-height:1.2;letter-spacing:-.015em;margin-bottom:16px}
p{margin-bottom:28px}
label{display:block;font-weight:600;font-size:15px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
input{width:100%;font:inherit;padding:12px 14px;border:1px solid rgba(245,240,230,.35);border-radius:2px;background:#fff;color:#1A2C40}
input:focus{outline:2px solid #C4962A;outline-offset:2px}
button{margin-top:16px;font:inherit;font-weight:600;padding:13px 24px;border:0;border-radius:2px;background:#F5F0E6;color:#1A2C40;cursor:pointer;transition:opacity .2s cubic-bezier(.4,0,.2,1)}
button:hover{opacity:.85}
.err{color:#C4962A;margin:12px 0 0;font-size:17px}
</style></head><body>
<header><div class="bar"><span class="wm"><span class="wm__the">THE</span><span class="wm__name">Geriatrician’s Guide</span><span class="wm__rule"></span></span></div><div class="rule"></div></header>
<main>
<div class="eyebrow">Private preview</div>
<h1>This site isn’t public yet.</h1>
<p>Enter the review password to continue.</p>
<form method="post" action="/__gate">
<input type="hidden" name="next" value="${esc(next)}">
<label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
${error ? '<p class="err" role="alert">That password didn’t work. Try again.</p>' : ""}
<button type="submit">Continue</button>
</form>
</main></body></html>`;
  return new Response(html, {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}

export default async (request, context) => {
  const url = new URL(request.url);
  const token = await tokenFor(PASSWORD);

  if (context.cookies.get(COOKIE) === token) return context.next();

  if (request.method === "POST" && url.pathname === "/__gate") {
    const form = await request.formData();
    const next = safeNext(form.get("next"));
    if (form.get("password") === PASSWORD) {
      return new Response(null, {
        status: 303,
        headers: {
          location: next,
          "cache-control": "no-store",
          "set-cookie": `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return gatePage(next, true);
  }

  return gatePage(url.pathname + url.search, false);
};

// /.netlify/* stays open so Netlify Identity (used by /admin) keeps working.
export const config = { path: "/*", excludedPath: ["/.netlify/*", "/favicon.ico"] };
