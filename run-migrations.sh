#!/bin/bash

# Script to help run SQL migrations on Supabase

PROJECT_REF="daqerobtwffhiwosodma"
SQL_EDITOR_URL="https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo "🗄️  Supabase Migration Helper"
echo "================================"
echo ""
echo "📋 Your SQL migration file is ready: supabase-setup.sql"
echo ""
echo "To run the migration:"
echo "1. Opening Supabase SQL Editor in your browser..."
echo "2. Copy the contents of supabase-setup.sql"
echo "3. Paste into the SQL Editor"
echo "4. Click 'Run' to execute"
echo ""
echo "SQL Editor URL: ${SQL_EDITOR_URL}"
echo ""

# Copy SQL to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
  cat supabase-setup.sql | pbcopy
  echo "✅ SQL has been copied to your clipboard!"
  echo ""
fi

# Open browser
if command -v open &> /dev/null; then
  open "${SQL_EDITOR_URL}"
  echo "🌐 Opening SQL Editor in your default browser..."
else
  echo "🌐 Please open this URL manually: ${SQL_EDITOR_URL}"
fi

echo ""
echo "Press any key when you've run the SQL migration..."
read -n 1 -s

echo ""
echo "✅ Great! Your database should now be updated with:"
echo "   - parent_code column for parents"
echo "   - parent_id column for kids"
echo "   - Indexes for fast lookups"
echo "   - Row Level Security policies"
echo ""
echo "🎉 You're all set! Kids can now link to parent accounts."
