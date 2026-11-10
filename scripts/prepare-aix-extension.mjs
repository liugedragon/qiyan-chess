#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(scriptDir);
const resources = JSON.parse(await fs.readFile(join(scriptDir, "resources.lock.json"), "utf8"));
const owner = process.env.AIX_EXTENSION_OWNER || resources.aix.owner;
const repository = process.env.AIX_EXTENSION_REPO || resources.aix.repository;
const tag = process.env.AIX_EXTENSION_TAG || resources.aix.tag;
const outputPath = process.env.AIX_EXTENSION_OUTPUT || join(repoRoot, "aixchess.duckdb_extension");
const force = process.env.AIX_EXTENSION_FORCE_DOWNLOAD === "1";
const targets = { "linux:x64": "linux_amd64", "linux:arm64": "linux_arm64", "darwin:x64": "osx_amd64", "darwin:arm64": "osx_arm64", "win32:x64": "windows_amd64", "win32:arm64": "windows_arm64" };
const target = process.env.AIX_EXTENSION_TARGET?.trim() || targets[`${process.platform}:${process.arch}`];

async function digest(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function verified(path, asset) {
  try {
    const stats = await fs.stat(path);
    return stats.isFile() && (!asset.size || stats.size === asset.size) && await digest(path) === asset.sha256;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function resolveAsset() {
  if (!target) throw new Error(`Unsupported Aix target: ${process.platform}/${process.arch}`);
  if (tag === "latest") throw new Error("Use a fixed AIX_EXTENSION_TAG and AIX_EXTENSION_SHA256, not latest.");
  const pinned = owner === resources.aix.owner && repository === resources.aix.repository && tag === resources.aix.tag;
  if (pinned) {
    const asset = resources.aix.targets[target];
    if (!asset) throw new Error(`No pinned Aix asset for ${target} in ${tag}. Windows x64 is the verified release platform.`);
    return asset;
  }
  const sha256 = process.env.AIX_EXTENSION_SHA256;
  if (!/^[a-fA-F0-9]{64}$/.test(sha256 || "")) throw new Error("Custom Aix releases require AIX_EXTENSION_SHA256.");
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "QiyanChess-build" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = `https://api.github.com/repos/${owner}/${repository}/releases/tags/${encodeURIComponent(tag)}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Cannot fetch Aix release metadata: HTTP ${response.status}`);
  const release = await response.json();
  const asset = release.assets?.find((item) => item.name?.endsWith(`-extension-${target}.duckdb_extension`));
  if (!asset?.browser_download_url) throw new Error(`No Aix extension for ${target} in ${tag}`);
  return { url: asset.browser_download_url, sha256: sha256.toLowerCase(), size: asset.size };
}

async function main() {
  const asset = await resolveAsset();
  if (!force && await verified(outputPath, asset)) {
    console.log(`Using verified Aix ${tag} (${target})`);
    return;
  }
  await fs.mkdir(dirname(outputPath), { recursive: true });
  const temporary = `${outputPath}.download-${process.pid}`;
  try {
    const response = await fetch(asset.url, { headers: { "User-Agent": "QiyanChess-build" } });
    if (!response.ok || !response.body) throw new Error(`Cannot download Aix asset: HTTP ${response.status}`);
    await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary));
    if (!await verified(temporary, asset)) throw new Error(`Aix checksum or size mismatch for ${target}`);
    await fs.rename(temporary, outputPath);
    console.log(`Downloaded and verified Aix ${tag} (${target})`);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
