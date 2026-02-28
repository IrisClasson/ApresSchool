# Version Management Guide

## Semantic Versioning (SemVer)

This project follows **Semantic Versioning 2.0.0** (https://semver.org/)

### Version Format: MAJOR.MINOR.PATCH

```
2.1.0
│ │ │
│ │ └─── PATCH: Bug fixes and minor changes
│ └───── MINOR: New features (backward compatible)
└─────── MAJOR: Breaking changes (not backward compatible)
```

## When to Bump Each Number

### PATCH Version (X.X.1)

Increment when you make **backward-compatible bug fixes**.

**Examples:**
- Fix broken button click handler
- Correct styling issue (text color, alignment)
- Fix broken link or routing
- Fix typo in user-facing text
- Performance improvements with no API changes
- Security patches

**Commit Message Patterns:**
```bash
git commit -m "fix: correct login button styling"
git commit -m "fix: resolve challenge completion bug"
git commit -m "fix: update broken navigation link"
```

**Version Change:** 2.1.0 → 2.1.1

---

### MINOR Version (X.1.X)

Increment when you add **new functionality in a backward-compatible manner**.

**Examples:**
- Add new feature (e.g., new game, new challenge type)
- Add language support (e.g., adding Swedish translations)
- Add new page or component
- Add new API endpoint
- Enhance existing feature without breaking it
- Add optional configuration

**Commit Message Patterns:**
```bash
git commit -m "feat: add Swedish language support"
git commit -m "feat: add creative break page with drawing"
git commit -m "feat: add PWA update notification system"
git commit -m "feat: add parent code sharing feature"
```

**Version Change:** 2.1.0 → 2.2.0

**Note:** Patch version resets to 0 when minor is bumped.

---

### MAJOR Version (1.X.X)

Increment when you make **incompatible API changes** or **major architectural changes**.

**Examples:**
- Change authentication system (requires users to re-login)
- Rename or remove existing API endpoints
- Change database schema in breaking way
- Complete UI redesign with different navigation
- Remove deprecated features
- Change core data structures

**Commit Message Patterns:**
```bash
git commit -m "BREAKING CHANGE: migrate to Supabase auth"
git commit -m "feat!: redesign challenge system (breaking)"
git commit -m "refactor!: replace localStorage with IndexedDB"
```

**Version Change:** 2.1.0 → 3.0.0

**Note:** Minor and patch versions reset to 0 when major is bumped.

---

## Current Version Status

**Current Version:** `2.1.0`

Located in:
- `public/version.json` - User-facing version (used by PWA update system)
- `package.json` - NPM package version

## Version File Structure

### public/version.json

```json
{
  "version": "2.1.0",
  "cacheVersion": "v6",
  "buildDate": "2026-02-28",
  "description": "PWA update system with language persistence"
}
```

**Fields:**
- `version`: Semantic version (displayed to users)
- `cacheVersion`: Service worker cache name suffix (increment when assets change)
- `buildDate`: ISO date of deployment
- `description`: Brief summary of what's new in this version

### package.json

```json
{
  "version": "0.1.0"
}
```

**Note:** Keep package.json in sync with version.json (automated by deploy script)

## Version Bumping Workflow

### Automated (Recommended)

Using the deployment script:

```bash
# Automatically determines bump type from commit messages
npm run deploy
```

The script:
1. Reads recent commits since last version tag
2. Determines bump type (major/minor/patch)
3. Updates `version.json` and `package.json`
4. Creates git commit with version bump
5. Creates git tag (e.g., `v2.1.1`)
6. Pushes to main (triggers Vercel deployment)

### Manual

```bash
# Patch bump (bug fix)
npm run version:patch
# Result: 2.1.0 → 2.1.1

# Minor bump (new feature)
npm run version:minor
# Result: 2.1.0 → 2.2.0

# Major bump (breaking change)
npm run version:major
# Result: 2.1.0 → 3.0.0
```

Then push to trigger deployment:
```bash
git push origin main --follow-tags
```

## Commit Message Conventions

Follow **Conventional Commits** (https://www.conventionalcommits.org/)

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature → **MINOR** bump
- `fix`: Bug fix → **PATCH** bump
- `docs`: Documentation only → **PATCH** bump
- `style`: Formatting, missing semicolons → **PATCH** bump
- `refactor`: Code change that neither fixes nor adds feature → **PATCH** bump
- `perf`: Performance improvement → **PATCH** bump
- `test`: Adding tests → **PATCH** bump
- `chore`: Updating build tasks, configs → **PATCH** bump

### Breaking Changes

Add `!` or `BREAKING CHANGE:` footer → **MAJOR** bump

```bash
# Using ! suffix
git commit -m "feat!: change auth system to Supabase"

# Using footer
git commit -m "feat: migrate auth

BREAKING CHANGE: Users need to re-register"
```

### Examples

```bash
# PATCH bump
git commit -m "fix: correct challenge completion points calculation"
git commit -m "docs: update README with deployment instructions"
git commit -m "style: fix button alignment on mobile"

# MINOR bump
git commit -m "feat(auth): add password reset functionality"
git commit -m "feat(challenges): add snowball math game"
git commit -m "feat(i18n): add Norwegian language support"

# MAJOR bump
git commit -m "feat!: replace localStorage with Supabase
BREAKING CHANGE: All local data will be lost on upgrade"
```

## Cache Version Management

The `cacheVersion` in `version.json` controls service worker caching.

### When to Increment

Increment `cacheVersion` when:
- Any static asset changes (CSS, JS, images)
- New features added that should invalidate old cache
- Bug fixes that require users to reload fresh code

**Rule of thumb:** Increment `cacheVersion` with **every deployment**.

### Naming Convention

```
v1, v2, v3, v4, ...
```

Simple incrementing numbers with `v` prefix.

**Current:** `v6`

## Git Tags

Tags mark version milestones and enable rollback.

### Creating Tags

```bash
# Tag current commit
git tag v2.1.0

# Tag with annotation (recommended)
git tag -a v2.1.0 -m "Release 2.1.0: PWA updates and language persistence"

# Push tags to remote
git push origin --tags
```

### Viewing Tags

```bash
# List all tags
git tag

# Show tag details
git show v2.1.0

# List tags with messages
git tag -n
```

### Rolling Back to a Tag

```bash
# Create branch from tag
git checkout -b rollback-2.0.0 v2.0.0

# Or reset main to tag (dangerous!)
git reset --hard v2.0.0
git push origin main --force
```

## Changelog Management

### Manual Changelog (Current)

Keep `description` field in `version.json` up to date:

```json
{
  "version": "2.2.0",
  "description": "New snowball game and Swedish translations"
}
```

### Automated Changelog (Future)

Consider adding `CHANGELOG.md`:

```markdown
# Changelog

## [2.2.0] - 2026-02-28
### Added
- Swedish language support
- PWA automatic update system
- Creative break page with drawing

### Fixed
- Login redirect for kid accounts
- Challenge completion notification timing

## [2.1.0] - 2026-02-26
### Added
- Clean minimalistic nature-themed UI redesign
- Real-time presence system

### Changed
- Updated color scheme to sage greens and warm beiges
```

Tools like `standard-version` or `semantic-release` can auto-generate this.

## Version Display

Users see the version in:

1. **App footer** - `AppVersion` component shows version from `version.json`
2. **Update prompt** - Shows current version when update is available
3. **Browser DevTools** - Console logs version on load

## Best Practices

### 1. Always Sync Versions
Keep `version.json` and `package.json` in sync (automated by scripts).

### 2. Tag Every Release
```bash
git tag -a v2.1.0 -m "Release 2.1.0"
git push --tags
```

### 3. Write Clear Commit Messages
Follow Conventional Commits for automatic version determination.

### 4. Test Before Bumping
```bash
npm run build
npm run preview
```

### 5. Update Description
Keep `version.json` description field meaningful.

### 6. Increment Cache Version
Always bump `cacheVersion` with deployments.

## Version History (Recent)

```
v2.1.0 - 2026-02-28 - PWA update system + language persistence
v2.0.0 - 2026-02-26 - Clean minimalistic UI redesign
v1.x.x - Earlier versions
```

## Quick Reference

```bash
# Check current version
cat public/version.json

# View recent commits for version planning
git log --oneline -10

# Deploy with auto version bump
npm run deploy

# Manual version bumps
npm run version:patch  # Bug fix
npm run version:minor  # New feature
npm run version:major  # Breaking change

# Create annotated tag
git tag -a v2.1.0 -m "Release message"

# Push with tags
git push origin main --follow-tags

# View all tags
git tag -l
```

## Resources

- **Semantic Versioning**: https://semver.org/
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Git Tagging**: https://git-scm.com/book/en/v2/Git-Basics-Tagging
- **NPM Versioning**: https://docs.npmjs.com/about-semantic-versioning
