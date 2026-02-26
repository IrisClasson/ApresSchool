#!/bin/bash

# Script to update app version
# Usage: ./update-version.sh [major|minor|patch]

if [ -z "$1" ]; then
  echo "Usage: ./update-version.sh [major|minor|patch]"
  echo "Example: ./update-version.sh patch"
  exit 1
fi

VERSION_FILE="version.json"

# Read current version
CURRENT_VERSION=$(node -p "require('./${VERSION_FILE}').version")
echo "Current version: ${CURRENT_VERSION}"

# Parse version parts
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Increment based on argument
case "$1" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Invalid argument. Use: major, minor, or patch"
    exit 1
    ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
BUILD_DATE=$(date +%Y-%m-%d)

echo "New version: ${NEW_VERSION}"

# Update version.json
cat > ${VERSION_FILE} << EOF
{
  "version": "${NEW_VERSION}",
  "cacheVersion": "v3",
  "buildDate": "${BUILD_DATE}"
}
EOF

# Copy to public folder
cp ${VERSION_FILE} public/${VERSION_FILE}

echo "✅ Version updated to ${NEW_VERSION}"
echo "📅 Build date: ${BUILD_DATE}"
echo ""
echo "💡 Tips:"
echo "- To force all users to refresh cached assets, update 'cacheVersion' in version.json"
echo "  (e.g., change 'v3' to 'v4')"
echo "- Service worker will automatically use the new cacheVersion"
echo ""
echo "Don't forget to commit:"
echo "  git add version.json public/version.json"
echo "  git commit -m \"Bump version to ${NEW_VERSION}\""
