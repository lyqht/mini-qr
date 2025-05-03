#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Clear the changelog file before starting
> public/CHANGELOG.md

# Get all tags sorted by version number (v prefix is handled)
tags=($(git for-each-ref --sort=-version:refname --format '%(refname:short)' refs/tags/v*))

# Process each tag
for ((i=0; i<${#tags[@]}; i++)); do
  tag="${tags[$i]}"
  
  # Get the range for commits
  if [ $i -eq 0 ]; then
    range="$tag..HEAD"
  else
    next_tag="${tags[$i-1]}"
    range="$tag..$next_tag"
  fi

  # Add a newline before each version section *except* the very first one
  if [ $i -gt 0 ]; then
    echo "" >> public/CHANGELOG.md
  fi

  # Arrays to store different types of commits
  features=()
  fixes=()
  translations=()
  others=()

  # Get commits in this range
  while IFS= read -r commit_msg; do
    # Skip version bump commits
    if [[ $commit_msg =~ ^v[0-9]+\.[0-9]+\.[0-9]+ ]]; then
      continue
    fi

    # Skip chore, docs, style, refactor commits unless they have a PR number
    if [[ $commit_msg =~ ^(chore|docs|style|refactor) && ! $commit_msg =~ \(#[0-9]+\) ]]; then
      continue
    fi

    # Skip commits that are just version numbers
    if [[ $commit_msg =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      continue
    fi

    # Extract PR number if exists
    if [[ $commit_msg =~ \(#([0-9]+)\) ]]; then
      pr_num=${BASH_REMATCH[1]}
      commit_msg=${commit_msg/ (#$pr_num)/}
    fi

    # Remove file-specific prefixes like "fix(QRCodeScan.vue):"
    # Quote the regex to prevent shell interpretation issues
    if [[ $commit_msg =~ '^[a-zA-Z]+\([^)]+\):' ]]; then
      commit_msg=${commit_msg#*): }
    fi

    # Format the commit message
    formatted_msg=""
    commit_type="other"
    
    # First try conventional commit format
    if [[ $commit_msg =~ ^feat: ]]; then
      formatted_msg="- ✨ ${commit_msg#feat: }"
      commit_type="feature"
    elif [[ $commit_msg =~ ^fix: ]]; then
      formatted_msg="- 🐛 ${commit_msg#fix: }"
      commit_type="fix"
    elif [[ $commit_msg =~ ^perf: ]]; then
      formatted_msg="- ⚡️ ${commit_msg#perf: }"
      commit_type="other"
    elif [[ $commit_msg =~ ^chore: ]]; then
      formatted_msg="- 🔧 ${commit_msg#chore: }"
      commit_type="other"
    elif [[ $commit_msg =~ ^docs: ]]; then
      formatted_msg="- 📝 ${commit_msg#docs: }"
      commit_type="other"
    elif [[ $commit_msg =~ ^style: ]]; then
      formatted_msg="- 💄 ${commit_msg#style: }"
      commit_type="other"
    elif [[ $commit_msg =~ ^refactor: ]]; then
      formatted_msg="- ♻️ ${commit_msg#refactor: }"
      commit_type="other"
    elif [[ $commit_msg =~ ^test: ]]; then
      formatted_msg="- ✅ ${commit_msg#test: }"
      commit_type="other"
    # Then try without colon
    elif [[ $commit_msg =~ ^feat ]]; then
      formatted_msg="- ✨ ${commit_msg#feat }"
      commit_type="feature"
    elif [[ $commit_msg =~ ^fix ]]; then
      formatted_msg="- 🐛 ${commit_msg#fix }"
      commit_type="fix"
    elif [[ $commit_msg =~ ^perf ]]; then
      formatted_msg="- ⚡️ ${commit_msg#perf }"
      commit_type="other"
    elif [[ $commit_msg =~ ^chore ]]; then
      formatted_msg="- 🔧 ${commit_msg#chore }"
      commit_type="other"
    elif [[ $commit_msg =~ ^docs ]]; then
      formatted_msg="- 📝 ${commit_msg#docs }"
      commit_type="other"
    elif [[ $commit_msg =~ ^style ]]; then
      formatted_msg="- 💄 ${commit_msg#style }"
      commit_type="other"
    elif [[ $commit_msg =~ ^refactor ]]; then
      formatted_msg="- ♻️ ${commit_msg#refactor }"
      commit_type="other"
    elif [[ $commit_msg =~ ^test ]]; then
      formatted_msg="- ✅ ${commit_msg#test }"
      commit_type="other"
    # Translation detection
    elif [[ $commit_msg =~ [Tt]ranslat(e|ion|ions)|locales|i18n|[Cc]rowdin ]]; then
      formatted_msg="- 🔧 ${commit_msg}"
      commit_type="translation"
    # Finally, try to infer type from content
    else
      # Common feature-related words
      if [[ $commit_msg =~ ^Add|^Create|^Implement|^Support ]]; then
        formatted_msg="- ✨ ${commit_msg}"
        commit_type="feature"
      # Common fix-related words
      elif [[ $commit_msg =~ ^Fix|^Resolve|^Correct|improve|^Update ]]; then
        formatted_msg="- 🐛 ${commit_msg}"
        commit_type="fix"
      # Common translation-related words (fallback)
      elif [[ $commit_msg =~ [Tt]ranslat(e|ion|ions)|locales|i18n|[Cc]rowdin ]]; then
        formatted_msg="- 🔧 ${commit_msg}"
        commit_type="translation"
      # Common refactor-related words
      elif [[ $commit_msg =~ ^Refactor|^Restructure|^Reorganize ]]; then
        formatted_msg="- ♻️ ${commit_msg}"
        commit_type="other"
      # Common docs-related words
      elif [[ $commit_msg =~ ^Document|^Update.*docs|^Add.*docs ]]; then
        formatted_msg="- 📝 ${commit_msg}"
        commit_type="other"
      else
        formatted_msg="- ${commit_msg}"
        commit_type="other"
      fi
    fi

    # Add PR link if exists
    if [ -n "$pr_num" ]; then
      formatted_msg="$formatted_msg\n  ([#$pr_num](https://github.com/lyqht/mini-qr/pull/$pr_num))"
    fi

    # Add to appropriate array
    if [ "$commit_type" = "feature" ]; then
      features+=("$formatted_msg")
    elif [ "$commit_type" = "fix" ]; then
      fixes+=("$formatted_msg")
    elif [ "$commit_type" = "translation" ]; then
      translations+=("$formatted_msg")
    else
      others+=("$formatted_msg")
    fi

  done < <(git log --pretty=format:"%s" "$range")

  # Only add version section if there are any commits
  if [ ${#features[@]} -gt 0 ] || [ ${#fixes[@]} -gt 0 ] || [ ${#translations[@]} -gt 0 ] || [ ${#others[@]} -gt 0 ]; then
    # Get the date of the tag
    tag_date=$(git log -1 --format=%ai "$tag" | cut -d' ' -f1)
    
    # Write the tag and date
    echo "## $tag ($tag_date)" >> public/CHANGELOG.md
    echo "" >> public/CHANGELOG.md

    # Write features first
    for msg in "${features[@]}"; do
      echo -e "$msg" >> public/CHANGELOG.md
    done

    # Write fixes second
    for msg in "${fixes[@]}"; do
      echo -e "$msg" >> public/CHANGELOG.md
    done

    # Write translations third
    for msg in "${translations[@]}"; do
      echo -e "$msg" >> public/CHANGELOG.md
    done

    # Write others last
    for msg in "${others[@]}"; do
      echo -e "$msg" >> public/CHANGELOG.md
    done

    echo "" >> public/CHANGELOG.md
  fi
done

# Directly append the hardcoded historical changelog entries
echo "" >> public/CHANGELOG.md # Add a separator line
echo "### v0.2.0 (2023-08-06)" >> public/CHANGELOG.md
echo "" >> public/CHANGELOG.md
echo "- ✨ Add Presets: Pre-crafted QR code styles available (padletPreset, uiliciousPreset, supabasePreset, vercelLightPreset, vercelDarkPreset)" >> public/CHANGELOG.md
echo "- 🐛 Refactor styles" >> public/CHANGELOG.md
echo "" >> public/CHANGELOG.md

echo "### v0.1.0 (2023-08-03)" >> public/CHANGELOG.md
echo "" >> public/CHANGELOG.md
echo "- ✨ Upload custom image for logo" >> public/CHANGELOG.md
echo "- 🐛 Fix inconsistencies in button & input styling" >> public/CHANGELOG.md
echo "- 🐛 Refactor styles" >> public/CHANGELOG.md
echo "- 🐛 Fix missing inputs for background color and border-radius" >> public/CHANGELOG.md
echo "" >> public/CHANGELOG.md

echo "### v0.0.0 (2023-03-25)" >> public/CHANGELOG.md
echo "" >> public/CHANGELOG.md
echo "- ✨ Generate QR codes with custom colors and styles" >> public/CHANGELOG.md
echo "- ✨ Support SVG and PNG output formats" >> public/CHANGELOG.md
echo "- ✨ Add Copy to clipboard feature" >> public/CHANGELOG.md
echo "- ✨ UI respects light/dark mode preferences" >> public/CHANGELOG.md
echo "- ✨ Add Randomize style button" >> public/CHANGELOG.md
echo "- 🔧 Available in 29 languages (via deepl-translate-github-action)" >> public/CHANGELOG.md
echo "- ✨ Save & Load QR Code config" >> public/CHANGELOG.md 