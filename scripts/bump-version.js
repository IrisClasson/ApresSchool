#!/usr/bin/env node

/**
 * Automated Version Bump Script
 *
 * Analyzes recent git commits and automatically determines version bump type:
 * - MAJOR: Breaking changes (BREAKING CHANGE: or feat!)
 * - MINOR: New features (feat:)
 * - PATCH: Bug fixes, docs, style, refactor, perf, test, chore (fix:, docs:, etc.)
 *
 * Usage:
 *   node scripts/bump-version.js [major|minor|patch]
 *   npm run version:patch
 *   npm run version:minor
 *   npm run version:major
 *   npm run deploy (auto-detects bump type)
 */

import fs from 'fs'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8', cwd: rootDir })
    if (!silent) {
      return output.trim()
    }
    return output
  } catch (error) {
    if (!silent) {
      log(`Error executing: ${command}`, 'red')
      log(error.message, 'red')
    }
    throw error
  }
}

// Read version.json
function readVersionFile() {
  const versionPath = path.join(rootDir, 'public', 'version.json')
  const content = fs.readFileSync(versionPath, 'utf8')
  return JSON.parse(content)
}

// Write version.json
function writeVersionFile(versionData) {
  const versionPath = path.join(rootDir, 'public', 'version.json')
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n', 'utf8')
}

// Read package.json
function readPackageFile() {
  const packagePath = path.join(rootDir, 'package.json')
  const content = fs.readFileSync(packagePath, 'utf8')
  return JSON.parse(content)
}

// Write package.json
function writePackageFile(packageData) {
  const packagePath = path.join(rootDir, 'package.json')
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n', 'utf8')
}

// Parse semantic version
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!match) {
    throw new Error(`Invalid version format: ${version}`)
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10)
  }
}

// Format version object to string
function formatVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`
}

// Bump version based on type
function bumpVersion(version, type) {
  const v = parseVersion(version)

  switch (type) {
    case 'major':
      return formatVersion({ major: v.major + 1, minor: 0, patch: 0 })
    case 'minor':
      return formatVersion({ major: v.major, minor: v.minor + 1, patch: 0 })
    case 'patch':
      return formatVersion({ major: v.major, minor: v.minor, patch: v.patch + 1 })
    default:
      throw new Error(`Invalid bump type: ${type}`)
  }
}

// Increment cache version (v1 -> v2)
function bumpCacheVersion(cacheVersion) {
  const match = cacheVersion.match(/^v(\d+)$/)
  if (!match) {
    return 'v1'
  }
  const num = parseInt(match[1], 10)
  return `v${num + 1}`
}

// Get commits since last tag
function getCommitsSinceLastTag() {
  try {
    // Get the latest tag
    const latestTag = exec('git describe --tags --abbrev=0', true)
    // Get commits since that tag
    const commits = exec(`git log ${latestTag}..HEAD --pretty=format:"%s"`, true)
    return commits.split('\n').filter(line => line.trim())
  } catch (error) {
    // No tags exist yet, get all commits
    try {
      const commits = exec('git log --pretty=format:"%s"', true)
      return commits.split('\n').filter(line => line.trim())
    } catch (err) {
      log('No commits found', 'yellow')
      return []
    }
  }
}

// Determine bump type from commit messages
function determineBumpType(commits) {
  let bumpType = 'patch' // Default to patch

  for (const commit of commits) {
    // Check for breaking changes
    if (commit.includes('BREAKING CHANGE:') || commit.match(/^[a-z]+!:/)) {
      return 'major' // Breaking change = major bump (highest priority)
    }

    // Check for features
    if (commit.startsWith('feat:') || commit.startsWith('feat(')) {
      bumpType = 'minor' // Feature = minor bump (overrides patch)
    }
  }

  return bumpType
}

// Get ISO date string
function getISODate() {
  return new Date().toISOString().split('T')[0]
}

// Main function
function main() {
  log('\n🚀 Version Bump Script\n', 'bright')

  // Get bump type from command line or auto-detect
  let bumpType = process.argv[2]

  if (!bumpType || bumpType === 'auto') {
    log('📝 Analyzing commit messages...', 'cyan')
    const commits = getCommitsSinceLastTag()

    if (commits.length === 0) {
      log('⚠️  No commits found since last tag. Defaulting to patch bump.', 'yellow')
      bumpType = 'patch'
    } else {
      bumpType = determineBumpType(commits)
      log(`   Found ${commits.length} commit(s) since last tag`, 'cyan')
      log(`   Detected bump type: ${bumpType.toUpperCase()}`, 'cyan')
    }
  }

  // Validate bump type
  if (!['major', 'minor', 'patch'].includes(bumpType)) {
    log('❌ Invalid bump type. Use: major, minor, or patch', 'red')
    process.exit(1)
  }

  // Read current versions
  const versionData = readVersionFile()
  const packageData = readPackageFile()
  const currentVersion = versionData.version

  log(`\n📦 Current version: ${currentVersion}`, 'blue')

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, bumpType)
  const newCacheVersion = bumpCacheVersion(versionData.cacheVersion)

  log(`📦 New version: ${newVersion}`, 'green')
  log(`🗂️  New cache version: ${newCacheVersion}`, 'green')

  // Update version.json
  versionData.version = newVersion
  versionData.cacheVersion = newCacheVersion
  versionData.buildDate = getISODate()

  // Optionally update description (preserve existing if not specified)
  if (process.argv[3]) {
    versionData.description = process.argv[3]
  }

  writeVersionFile(versionData)
  log('✅ Updated public/version.json', 'green')

  // Update package.json
  packageData.version = newVersion
  writePackageFile(packageData)
  log('✅ Updated package.json', 'green')

  // Git operations
  try {
    log('\n📝 Creating git commit...', 'cyan')
    exec('git add public/version.json package.json')
    exec(`git commit -m "chore: bump version to ${newVersion}"`)
    log('✅ Created commit', 'green')

    log('🏷️  Creating git tag...', 'cyan')
    exec(`git tag -a v${newVersion} -m "Release ${newVersion}"`)
    log(`✅ Created tag v${newVersion}`, 'green')

    log('\n✨ Version bump complete!', 'bright')
    log(`\nNext steps:`, 'cyan')
    log(`  1. Push to remote: git push origin main --follow-tags`, 'cyan')
    log(`  2. Vercel will automatically deploy`, 'cyan')
    log(`  3. Users will see update notification within 60 seconds\n`, 'cyan')

  } catch (error) {
    log('\n⚠️  Git operations failed (this is OK if no git repo)', 'yellow')
    log('Version files updated successfully', 'green')
  }
}

// Run the script
try {
  main()
} catch (error) {
  log(`\n❌ Error: ${error.message}`, 'red')
  process.exit(1)
}
