#!/usr/bin/env node
/**
 * Validates every .mdx file under workflows/ against the schema defined in
 * SCHEMA.md. Run on every PR via .github/workflows/validate.yml.
 *
 * Exits non-zero on any failure. Annotates the offending file:line.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(ROOT, 'workflows');

const TIER_VALUES = new Set(['snippet', 'framework', 'tool']);
const ALLOWED_RELATED_KEYS = new Set([
  'laws', 'patterns', 'antiPatterns', 'practices',
  'glossary', 'tools', 'aiAssistants', 'workflows',
]);

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

const errors = [];
function err(file, msg) { errors.push(`${file}: ${msg}`); }

function parseFrontmatter(text, file) {
  const m = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) {
    err(file, 'missing or malformed frontmatter (must open with `---` and close with `---`)');
    return null;
  }
  try {
    return { data: yaml.load(m[1]), body: m[2] };
  } catch (e) {
    err(file, `frontmatter YAML parse error: ${e.message}`);
    return null;
  }
}

function isUrl(s) {
  if (typeof s !== 'string') return false;
  try { const u = new URL(s); return u.protocol === 'https:' || u.protocol === 'http:'; }
  catch { return false; }
}

function validateRequired(data, file) {
  for (const key of ['title', 'tagline', 'tier', 'canonical_url']) {
    if (data[key] == null || data[key] === '') {
      err(file, `missing required field: ${key}`);
    }
  }
  if (typeof data.title === 'string' && data.title.length > 120) {
    err(file, `title too long (${data.title.length} chars; max 120)`);
  }
  if (typeof data.tagline === 'string' && data.tagline.length > 220) {
    err(file, `tagline too long (${data.tagline.length} chars; max 220)`);
  }
  if (data.tier && !TIER_VALUES.has(data.tier)) {
    err(file, `invalid tier "${data.tier}" — must be one of: ${[...TIER_VALUES].join(', ')}`);
  }
  if (data.canonical_url && !isUrl(data.canonical_url)) {
    err(file, `canonical_url is not a valid http(s) URL: ${data.canonical_url}`);
  }
}

function validateOptional(data, file) {
  if (data.tags != null && (!Array.isArray(data.tags) || data.tags.some((t) => typeof t !== 'string'))) {
    err(file, 'tags must be an array of strings');
  }
  if (data.attribution != null && typeof data.attribution !== 'string') {
    err(file, 'attribution must be a string or null');
  }
  if (data.upstream) {
    if (typeof data.upstream !== 'object' || Array.isArray(data.upstream)) {
      err(file, 'upstream must be an object');
    } else {
      if (typeof data.upstream.repo !== 'string' || !data.upstream.repo.includes('/')) {
        err(file, 'upstream.repo must be a string in "owner/name" form');
      }
      if (data.upstream.ref != null && typeof data.upstream.ref !== 'string') {
        err(file, 'upstream.ref must be a string (branch / tag / commit SHA)');
      }
      if (data.upstream.paths != null) {
        if (!Array.isArray(data.upstream.paths) || data.upstream.paths.some((p) => typeof p !== 'string')) {
          err(file, 'upstream.paths must be an array of strings');
        }
      }
    }
  }
  if (data.sources != null) {
    if (!Array.isArray(data.sources)) {
      err(file, 'sources must be an array');
    } else {
      data.sources.forEach((s, i) => {
        if (!s || typeof s !== 'object') err(file, `sources[${i}] must be an object`);
        else if (!isUrl(s.url)) err(file, `sources[${i}].url is missing or not a valid URL`);
      });
    }
  }
  if (data.related != null) {
    if (typeof data.related !== 'object' || Array.isArray(data.related)) {
      err(file, 'related must be an object');
    } else {
      for (const [k, v] of Object.entries(data.related)) {
        if (!ALLOWED_RELATED_KEYS.has(k)) {
          err(file, `related.${k}: unknown collection key. Allowed: ${[...ALLOWED_RELATED_KEYS].join(', ')}`);
        }
        if (!Array.isArray(v) || v.some((s) => typeof s !== 'string')) {
          err(file, `related.${k} must be an array of slug strings`);
        }
      }
    }
  }
}

function validateSlug(file, slug) {
  if (!SLUG_RE.test(slug)) {
    err(file, `slug "${slug}" must match /[a-z0-9][a-z0-9-]*/`);
  }
  if (slug.length > 60) {
    err(file, `slug "${slug}" too long (${slug.length} chars; max 60)`);
  }
}

async function main() {
  let files;
  try {
    files = (await fs.readdir(WORKFLOWS_DIR)).filter((f) => f.endsWith('.mdx'));
  } catch (e) {
    console.error(`Cannot read workflows/ directory: ${e.message}`);
    process.exit(1);
  }

  const slugs = new Set();
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    validateSlug(`workflows/${file}`, slug);
    if (slugs.has(slug)) err(`workflows/${file}`, `duplicate slug "${slug}"`);
    slugs.add(slug);

    const text = await fs.readFile(path.join(WORKFLOWS_DIR, file), 'utf8');
    const parsed = parseFrontmatter(text, `workflows/${file}`);
    if (!parsed) continue;
    validateRequired(parsed.data, `workflows/${file}`);
    validateOptional(parsed.data, `workflows/${file}`);
  }

  if (errors.length > 0) {
    console.error(`\n✗ Validation failed (${errors.length} error${errors.length === 1 ? '' : 's'}):\n`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log(`✓ All ${files.length} workflow${files.length === 1 ? '' : 's'} valid.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
