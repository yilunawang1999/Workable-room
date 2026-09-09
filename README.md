# A workable world · 縫熊志

A browser-based research vertical slice inspired by Xi Xi’s *The Teddy Bear Chronicles*. The room moves through fragmentation, making and reorientation. Completing the bear opens another way of inhabiting the room; the prototype makes no claim about clinical recovery or therapeutic efficacy.

## Run

Use Node.js 24 (recorded in `.nvmrc` and used by GitHub Actions). Install with `npm ci`, then run `npm run dev:pages` for the standalone static app, or `npm run dev` for the original hosting shell. This is a React 19 application served by Vite 8 with a small Vinext routing/hosting shell. The experience is client-only and built with React Three Fiber 9, Three.js and `@react-three/drei`. `npm run build:pages` produces the standalone static site in `dist-pages/`; `npm run preview:pages` serves that built output locally. `npm run build` still produces the original production Worker and client assets in `dist/`. No API keys, remote models, fonts, audio downloads or application database are required.

For the managed development preview, use `sites-preview start /workspace/sites/workable-room`. Elsewhere, Vite prints the local development address after `npm run dev`.

## Complete the sequence

1. Enter the room. Click **approach the table**, or move with WASD / arrow keys. Hold the right mouse button and drag to look. The mouse wheel moves forward/backward. Click exposed floor to approach a location.
2. Click the loose bear arm or its **pick up** cue. Move the mouse to carry it over the table. The camera settles at the work surface.
3. Click **place** at the bear’s open shoulder. The arm snaps into its sewing position.
4. Hold the first needle hole and drag slowly to the other hole, then release. Repeat for all three pairs. Each gesture must last at least 220 ms and travel at least 8 pixels; a missed drop leaves the stitch unfinished. Finished stitches remain as physical thread geometry. For keyboard access, focus the start hole and press Enter, then press Enter at the finish hole.
5. Click **pick up** on the repaired bear. The view turns towards the window while the bear is carried in front of you. Click **place by the window** to set it on the cloth-covered cabinet.
6. The final reflective prompt appears. Remain in the room or continue moving and handling the loose cloth.

`Q` puts a held object back. Loose blue/green cloth can also be placed by clicking the tabletop. `T` turns to the work surface; `V` turns to the window. `M` toggles sound. `Esc` or `H` opens room controls, where the experience can be resumed or restarted. Small touch navigation controls provide a basic tablet fallback; desktop is the primary interaction mode.

Audio starts after entering. It is quiet, locally synthesised room tone and a brief fabric rustle, with a very quiet, sparse musical layer made from filtered triangle oscillators. The pitch collection stays unresolved throughout; spacing, duration and stereo position change slightly. There are no remote tracks, reward chimes or spoken narration. If a browser blocks audio, the visual sequence remains usable.

## Refinement notes

The progression reducer and sequence are preserved. Live thread follows pointer events on a plane transformed with the bear, with a small sag. Each completed stitch tightens over 1.25 seconds and gently compresses the attachment area. The three threads differ slightly in endpoint spacing, curvature, colour and thickness. Targets use 30 px hit areas plus drop tolerance; a missed gesture resets quietly. Reduced-motion mode skips the pulling animation.

Perceptual change is distributed across fog depth, directional/fill balance, distant shelf light, wood contrast, surface roughness and two persistent window veils. Light colour and global saturation remain fixed. The window never becomes fully clear. The bear has a mismatched replacement arm, uneven panels, old repairs and slight stuffing compression; curtain hems, a repaired cushion and paper patterns repeat the room’s language of making.

**Presentation shortcut:** `Shift+R` resets the current visit in place. Pause stops audio time and music scheduling; restart clears short-lived sounds and restarts the musical spacing. Music and room tone share the existing mute control. Background tabs suspend audio.

## Component map

| File | Responsibility |
| --- | --- |
| `app/page.tsx` | Loads the client-only experience through the Vite/Vinext shell. |
| `index.html`, `src/pages-main.tsx` | Standalone static entry; loads the same experience and stylesheet without a server. |
| `vite.pages.config.ts` | Static build output and portable deployment base path. |
| `components/experience/Experience.tsx` | Scene composition, transient cues, pause controls and shared interaction commands. |
| `progression.ts` | Pure reducer: `FRAGMENTED → MAKING → REORIENTED`; held object, attachment and ordered stitch guards. |
| `RoomEnvironment.tsx` | Table, room, window, shelves, chair, sewing materials and domestic objects. |
| `TeddyBear.tsx` | Handmade bear geometry, missing arm and permanent completed threads. |
| `InteractiveObject.tsx` | Reusable selection, hover cues and pointer/camera-based carrying. |
| `StitchingInteraction.tsx` | Forgiving pointer start/end validation, a curved live thread and keyboard alternative. |
| `Player.tsx` | Desktop navigation, room/table/window views and basic room/table collision limits. |
| `EnvironmentTransition.tsx` | Independent changes to fog depth, local light, contrast and material response; fixed light colour. |
| `AudioState.ts` | Gesture-unlocked spatial room layers, cloth/thread friction, sparse synthesis, pause, mute and disposal. |
| `TextFragments.tsx` | Brief annotations anchored beside cloth/paper; final prompt remains in Experience. |
| `materials.tsx`, `Thread.tsx` | Small procedural fabric/wood/paper textures; persistent, curved thread buffers and tightening. |
| `renderer.ts` | WebGL renderer and automatic software-rendered Three.js fallback. |
| `XRBridge.tsx` | Optional immersive WebXR session entry and exit. |
| `data/fragments.ts` | Placeholder text and source fields for later verified excerpts. |

Paths without a directory prefix in this table are under `components/experience/`.

## Literary content

All in-room literary fragments are visibly marked placeholders, not quotations. Replace `data/fragments.ts` entries with verified excerpts, keeping their source, edition, page and permissions records. The final question—“What changes when the world becomes workable again?”—is prototype interface text, not attributed to Xi Xi.

## WebXR / Meta Quest boundary

On browsers advertising `immersive-vr`, room controls offer **View in headset**. This activates Three.js’s WebXR session support for looking around. Session creation requires HTTPS (or a trusted local development context). Physical headset hardware has not been tested.

Controller-based sewing, grabbing and locomotion are intentionally not enabled in this desktop milestone. The shared `command(Action)`/`progression` boundary is ready for a controller-ray adapter: map select/grab to `PICK`, valid shoulder placement to `ATTACH`, needle gestures to ordered `STITCH`, and the window placement to `PLACE_WINDOW`. Replace DOM-based `Html` cues with in-world meshes/text for the immersive interaction mode. Room geometry, material assets, state progression, audio and environment transitions can remain shared.

## Rendering and validation

WebGL is the primary renderer and includes procedural material textures, soft shadows and colour management. When WebGL is unavailable, the same Three.js scene, camera, raycasting and interaction components use the bundled SVG software renderer. This fallback has faceted shading, no texture maps or shadow maps, and painter-sorting artefacts on overlapping surfaces; it is intended to preserve access to the interaction, not to match the main renderer’s appearance. Camera view changes are immediate in software mode and when reduced motion is requested.

Run `npm run test:experience` for the progression guards and interruption/re-entry checks. Run `npx tsc --noEmit --project tsconfig.experience.json` to type-check the experience source. The generated hosting shell has separate platform types.

The refined static production build was checked at `/REPOSITORY/`: entry, approach, arm pickup and snap placement, a deliberately missed drag (no progression), three valid mouse-drag stitches, bear pickup, window placement and the final prompt. After the thread visibility correction, another complete run checked the keyboard start/end alternative, pointer sewing, the curved live thread and all three retained threads. Pause, mute/unmute, restart, `Shift+R` and refresh were checked through visible controls. No application console errors were observed; browser-extension errors were excluded. Both production build targets, the progression guards and the scoped TypeScript check passed. A fresh locked dependency installation also passed during recovery of the checkout.

The available QA browser disables WebGL, so visual/interaction verification used the automatic software fallback. Its face sorting, shading, missing texture maps and missing shadows remain below the intended GPU presentation quality. Hardware WebGL and Meta Quest still need a device check. Web Audio ran through entry, sewing, pause, mute and reset without runtime errors; the remote test does not verify subjective musical balance or playback through physical speakers. Check the quiet mix on the laptop/headphones intended for presentation. No state-manipulation test hook is present.

## Scope

One room, one missing arm, three stitches and one placement at the window. Navigation uses simple bounds, not a physics engine. Interaction state lasts for the current visit and is not recorded or uploaded. There are no scores, timers, achievements, participant analytics or clinical measures.

# Publish on GitHub Pages

### What this repository builds

The original `vite.config.ts` enables Vinext and Cloudflare's Vite plugin. Its production output contains `dist/server/index.js`, a Worker that serves the application. GitHub Pages cannot run that server. The new `vite.pages.config.ts` instead builds `index.html` and `src/pages-main.tsx` with Vite's React plugin into **`dist-pages/`**. That entry imports the existing `Experience.tsx` and `app/globals.css`. The static target uses the refined scene, interactions, materials, synthesis and XRBridge without a separate implementation. The original reducer guards and XRBridge are unchanged.

The Pages site has one address: its repository root, `/REPOSITORY/`. Direct entry and refreshing that address load its real `index.html`; the experience does not use additional client-side routes. Visit the site through HTTP/HTTPS, not by double-clicking `index.html`. A refresh begins a new visit, as before.

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and can also be started manually. It installs Node 24 from `.nvmrc`, runs `npm ci`, checks progression, runs `npm run build:pages`, verifies emitted asset paths, uploads **only `dist-pages/`**, and deploys with GitHub's official Pages Actions. It uses the workflow's built-in token; no deployment token or Cloudflare account is needed. The existing Worker build remains available separately. See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### First publication

1. Sign in to GitHub, choose **New repository**, choose a repository name (for example `workable-room`), and make it **Public**. Create an empty repository: leave the initial README, `.gitignore` and license options unselected because this project already supplies its source files.
2. Extract `workable-room-github-pages.zip`. Open a terminal inside the extracted `workable-room` folder, where `package.json` is located. Push the **whole source project**, including hidden `.github/`, `.nvmrc` and `.gitignore`, along with `package-lock.json`, `src/`, `app/`, `components/`, `data/`, `public/`, `scripts/`, `tests/` and the configuration files. Do not push the ZIP itself as a substitute for its contents. The archive contains no Git history or authenticated remote.
3. Initialise and push it, replacing `USERNAME` and `REPOSITORY` in the remote URL with your GitHub account and the name you just chose:

   ```bash
   git init -b main
   git add .
   git commit -m "Add interactive sewing-room prototype and Pages deployment"
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

   These commands are for the supplied archive and a new empty repository. If you use an existing Git checkout, keep its history, run `git branch -M main`, and inspect `git remote -v` before setting the intended GitHub remote with `git remote set-url origin https://github.com/USERNAME/REPOSITORY.git`.
4. On the repository's **Settings → General** page, confirm **Default branch** is `main`. If another branch is selected, use the edit/switch control under **Default branch**, choose `main` and confirm. The branch must exist first. See [GitHub's default-branch instructions](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch).
5. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**. Do not choose deployment from a branch or create a `gh-pages` branch.
6. The first push starts **Deploy prototype to GitHub Pages** automatically. If that run began before Pages was enabled, go to **Actions → Deploy prototype to GitHub Pages → Run workflow**, select `main`, and run it again after step 5. The supplied workflow is already complete; you do not need to generate another workflow from a template.
7. In **Actions**, open that run and check that both **build** and **deploy** finish successfully. Expand a failed step to see its log. The successful deploy job's `github-pages` environment link and **Settings → Pages** show the public site address.
8. Your repository site will be **`https://USERNAME.github.io/REPOSITORY/`**. Use that HTTPS address. In **Settings → Pages**, keep **Enforce HTTPS** enabled where the control is available; GitHub's default `github.io` domain supports HTTPS. This preserves the secure context needed by `XRBridge`. Full Quest controller interaction remains outside this milestone. See [GitHub's HTTPS documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).
9. Open the public link and complete the arm placement, three stitches and window placement. The local static build was tested before delivery; the GitHub deployment itself has not been performed for you.
10. To publish future edits, commit and push to `main`. The same workflow rebuilds and redeploys automatically:

    ```bash
    git add .
    git commit -m "Update the sewing-room prototype"
    git push origin main
    ```

Generated and local files are excluded by `.gitignore`: `node_modules/`, `dist/`, `dist-pages/`, `.next/`, `.wrangler/`, `.sites-runtime/`, `.pages-qa/`, coverage, logs and `.env*`. Keep the lockfile in Git. The portable archive retains neutral `.openai/hosting.json` metadata for the original shell, without an existing hosted project's identity; the Pages build does not read that file.

### Repository path and local checks

No GitHub username is hard-coded. In Actions, `configure-pages` supplies the configured site's base path to the build. For a normal project repository, that is `/REPOSITORY/`; a user site repository named `USERNAME.github.io` or a configured root custom domain uses `/`. `vite.pages.config.ts` also detects `GITHUB_REPOSITORY` when built in GitHub outside this workflow. A local production build defaults to relative URLs (`./`). This follows [Vite's repository-subpath deployment model](https://vite.dev/guide/static-deploy).

Usually no configuration edit is needed after choosing or renaming the repository. To override the base deliberately, add a repository **Actions variable** named `PAGES_BASE_PATH` at **Settings → Secrets and variables → Actions → Variables**, for example `/REPOSITORY/` or `/`. This takes priority over Pages metadata; remove a stale override after renaming the repository. It is a path, not a full URL.

To build and inspect locally with Node 24:

```bash
npm ci
npm run test:experience
npm run build:pages
npm run check:pages
npm run preview:pages
```

To reproduce repository-subpath hosting before publishing:

```bash
npm run build:pages -- --base=/REPOSITORY/
npm run check:pages
npm run preview:pages -- --base=/REPOSITORY/
```

Open the `/REPOSITORY/` path on the address printed by Vite. The static checker verifies the HTML, stylesheet, JavaScript, icon, manifest dependencies and lazy-loaded scene chunk exist in `dist-pages/`. The workflow also checks that HTML references begin with the expected Pages base.

All current Three.js geometry, fabric/wood/paper textures, room audio and background music are generated locally; no resource URL needs an external host. Vite rewrites bundled imports. When adding future files, import assets from source or prefix public-file URLs with `import.meta.env.BASE_URL`; avoid absolute `/asset.ext` paths. Audio is unlocked by **Enter the room** and can be toggled in room controls. Music has long intentional gaps, so silence between tones is expected. Check site/tab mute and room controls if all sound is absent; there are no audio files to download or rehost.

### Troubleshooting

| Symptom | Check and repair for this project |
| --- | --- |
| Blank page after deployment | Open the `github-pages` URL from the successful deploy job, including `/REPOSITORY/`. In browser Developer Tools, inspect Console and Network for failed JS/CSS requests. Confirm Pages uses **GitHub Actions** and the workflow uploads `dist-pages`, not the Worker `dist` folder. Reload after the new deploy finishes. |
| Incorrect Vite base path | Inspect `PAGES_BASE_PATH` in repository Actions variables. Remove an old override to restore automatic detection, or set the exact case-sensitive `/REPOSITORY/`. A custom domain served at its root needs `/`. Run the workflow again; the base is embedded at build time. |
| Missing images/audio/music/assets | Confirm the requested file is committed, its filename case matches, and its URL includes the repository path. Keep `public/favicon.svg`. Use source imports or `import.meta.env.BASE_URL` for new assets. Rebuild and run `npm run check:pages`; do not edit generated bundle paths by hand. |
| 404 after refresh | Open `/REPOSITORY/` or `/REPOSITORY/index.html`, both of which map to an emitted HTML file. There are no additional experience routes. Check that Pages uses GitHub Actions and uploads `dist-pages/`; never upload `dist/server/`. A refresh resets this visit intentionally. |
| GitHub Actions build failure | Open **Actions → Deploy prototype to GitHub Pages → failed run → build** and expand the failed step. Keep `.nvmrc` at Node 24 and commit a matching `package-lock.json` after dependency changes. Reproduce with `npm ci`, `npm run test:experience`, `npm run build:pages` and `npm run check:pages`. If **Configure GitHub Pages** fails, enable Pages with **Source: GitHub Actions**, then rerun. If deployment permissions are blocked by organisation policy, allow the official Pages Actions and this workflow's `pages: write` / `id-token: write` permissions. |

Publication remains a manual handoff: create your GitHub repository, push this source, enable Pages, and check the deployment run. No public GitHub repository or Pages deployment was created during preparation.
