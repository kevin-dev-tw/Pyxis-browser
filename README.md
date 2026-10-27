# Pyxis start page

Static new-tab page for the Pyxis browser.

## Files
- `index.html` — start page (keeps `{{THEME_VARS}}` inside `<style>`; the browser injects theme CSS variables there)
- `version.json` — bump `version` on every release to push updates to browsers

## Deploy
1. `git init && git add -A && git commit -m "start page"` && push to GitHub
2. Vercel → Import this repo (framework: Other, no build command, output = repo root)
3. Set `StartPageRemoteUrl` in `%LocalAppData%\Pyxis\settings.json` to `https://<your-project>.vercel.app`