# PRO MOD website

The English project website for ProTel and Materials. A monochrome, responsive
static site with downloadable JARs, checksums, an interactive recipe book,
installation instructions, machine guides, ore distribution and troubleshooting.

## Cloudflare

The deployable site is **`public/`**. It is already built and has no runtime dependencies.

- **Workers:** the included `wrangler.jsonc` serves `./public` as static assets.
  Use `npx wrangler deploy`, or connect this repository in Workers Builds with
  that deploy command. No build step is required (`npm run build` runs checks).
- **Pages Git integration:** use framework preset None, output directory `public`,
  and no build command (or `npm run build` for validation).
- **Pages Direct Upload:** upload the contents of `public/`, with `index.html`
  at the root. The repository contains no Cloudflare credentials or account IDs.

Reference: [Cloudflare static assets documentation](https://developers.cloudflare.com/workers/static-assets/get-started/).

## Local preview and checks

Requires Node.js 20+. No npm install is needed.

```sh
npm run dev
npm test
```

Preview: http://127.0.0.1:8767. Set `PORT` to change it.

## Updating content

- Edit `scripts/build-pages.py` for page copy and page layouts, then run it with Python 3.
- Edit `public/assets/site.css` and `public/assets/site.js` for styling and recipe interactions.
- To import a new tested ProMod release, first update versions in `scripts/import-mod.py`.
  Generate the local ProMod crafting guide and package the JARs, then run:

```sh
python scripts/import-mod.py /path/to/MOD-TEL
python scripts/build-pages.py
npm test
```

The importer copies recipe data and pixel textures from the generated guide,
checks embedded JAR versions, and creates the download manifest and SHA-256 checksums.
`public/downloads/RECIPES.txt` is the no-JavaScript recipe reference.

## Current downloads

- ProTel 1.2.2 — internal ID `modtel` is preserved for existing saves.
- Materials 0.4.0 — coal press: **5 seconds**; electric press: **1 second**, 800 E per sheet (40 E/t). Platinum and silicon remain at **Y=-6 through Y=16**.
- Minecraft Java 1.21.11, Fabric, Java 21. Fabric API is a separate requirement.

Both mods are required on the server and clients when used in multiplayer.
No phone/SIM crafting, internet service, app store, generator or placeable cable
is claimed in these versions. These are development releases.

The JARs and original mod artwork remain all rights reserved. See the download
folder for third-party notices. A source commit does not itself confirm a
Cloudflare deployment; check the connected Cloudflare project for its live URL.

Materials 0.2.4 adds optional JEI / REI process categories and bidirectional material tags. Tested viewer versions and dependencies are listed in the public compatibility guide. Recipe viewers are installed separately and are not included in the downloads.

Materials 0.3.0: tin and two Mixing Smelters (6/9 input slots, 10/5 seconds), optional fluid piping through Fabric Transfer API, JEI/REI process views. Smelter crafting is intentionally deferred; Creative and /give are documented.

Materials 0.3.1 refreshes both Mixing Smelter models and derives their website previews directly from the in-game geometry and textures. Recipes and timing stay unchanged.

Materials 0.4.0 adds Cleared Silicon and UV Solution. Electric mixing consumes four solids and 1000 mB UV per 5-second cycle. UV crafting reuses one bucket and returns the other; common tags accept equivalent modded ingredients. Includes fluid rendering, pipe transfer and JEI/REI support.
