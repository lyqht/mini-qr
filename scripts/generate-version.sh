#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Clear the changelog file before starting
> public/CHANGELOG.md

# Get all tags sorted by version number (newest first)
tags=($(git for-each-ref --sort=-version:refname --format '%(refname:short)' refs/tags/v*))
repo_url="https://github.com/lyqht/mini-qr" # Define repo URL here

# Process each tag (version)
for ((i=0; i<${#tags[@]}; i++)); do
  current_tag="${tags[$i]}"
  
  # Determine the previous tag or commit hash
  if [ $((i + 1)) -lt ${#tags[@]} ]; then
    previous_tag="${tags[$i+1]}"
  else
    # For the oldest tag, find its commit hash
    oldest_tag_commit=$(git rev-list -n 1 "$current_tag" 2>/dev/null)
    # Find the parent commit hash (commit before the tag)
    previous_tag=$(git rev-parse "$oldest_tag_commit^" 2>/dev/null) 
    # If no parent (initial commit), use the hash of the initial commit
    if [ -z "$previous_tag" ] || [ $? -ne 0 ]; then
        previous_tag=$(git rev-list --max-parents=0 HEAD)
    fi
  fi
  
  # Define the range for the current tag's commits: from previous tag/commit up to current tag
  range="$previous_tag..$current_tag"
  
  # Arrays to store different types of commits for this version
  features=()
  fixes=()
  translations=()
  others=()
  
  # Get commits in this range (Hash and Subject), ignore merges
  commit_data=$(git log --no-merges --pretty=format:"%H %s" "$range") 
  
  # Skip if no commits found for this range
  if [ -z "$commit_data" ]; then
      continue 
  fi

  while IFS= read -r line; do
    # commit_hash=$(echo "$line" | cut -d' ' -f1) # Hash available if needed
    commit_msg=$(echo "$line" | cut -d' ' -f2-) 

    # Extract PR number first
    pr_num=""
    if [[ $commit_msg =~ \ \(#([0-9]+)\)$ ]]; then # Match PR number strictly at the end
      pr_num=${BASH_REMATCH[1]}
    fi
    
    # Skip simple version bump commits like "vX.Y.Z" unless they have a PR number
    if [[ $commit_msg =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ && -z "$pr_num" ]]; then
      continue
    fi

    # Skip chore, docs, style, refactor commits unless they have a PR number
    # Check various forms like chore(...):, chore:, chore<space>
    # Use case-insensitive matching for the type prefix
    shopt -s nocasematch
    should_skip=false
    if [[ $commit_msg =~ ^(chore|docs|style|refactor)(\(.*\))?: && -z "$pr_num" ]]; then should_skip=true; fi
    if [[ $commit_msg =~ ^(chore|docs|style|refactor)[[:space:]] && -z "$pr_num" ]]; then should_skip=true; fi
    shopt -u nocasematch # Turn off case-insensitivity immediately after use
    if $should_skip; then continue; fi

    # Get message without the PR part like " (#123)" at the end
    if [ -n "$pr_num" ]; then
       commit_msg_no_pr=$(echo "$commit_msg" | sed -E "s/[[:space:]]*\\(#${pr_num}\\)$//")
    else
       commit_msg_no_pr=$commit_msg
    fi
   
    # Use commit_msg_no_pr for classification and extracting content
    content_msg=$commit_msg_no_pr # Start with the message without PR link
    formatted_msg=""
    commit_type="other"
    
    # Try conventional commit format (case insensitive for prefix)
    shopt -s nocasematch
    if [[ $commit_msg_no_pr =~ ^feat(:|[[:space:]]|(\(.*\):)) ]]; then 
        content_msg=$(echo "$commit_msg_no_pr" | sed -E 's/^feat(\(.*\))?(:|[[:space:]])[[:space:]]*//I') # Remove prefix/scope
        formatted_msg="- ✨ ${content_msg}"; commit_type="feature";
    elif [[ $commit_msg_no_pr =~ ^fix(:|[[:space:]]|(\(.*\):)) ]]; then 
        content_msg=$(echo "$commit_msg_no_pr" | sed -E 's/^fix(\(.*\))?(:|[[:space:]])[[:space:]]*//I')
        formatted_msg="- 🐛 ${content_msg}"; commit_type="fix";
    elif [[ $commit_msg_no_pr =~ ^perf(:|[[:space:]]|(\(.*\):)) ]]; then 
        content_msg=$(echo "$commit_msg_no_pr" | sed -E 's/^perf(\(.*\))?(:|[[:space:]])[[:space:]]*//I')
        formatted_msg="- ⚡️ ${content_msg}"; commit_type="other";
    elif [[ $commit_msg_no_pr =~ ^chore(:|[[:space:]]|(\(.*\):)) ]]; then 
        content_msg=$(echo "$commit_msg_no_pr" | sed -E 's/^chore(\(.*\))?(:|[[:space:]])[[:space:]]*//I')
        formatted_msg="- 🔧 ${content_msg}"; commit_type="other";
    elif [[ $commit_msg_no_pr =~ ^docs(:|[[:space:]]|(\(.*\):)) ]]; then 
        content_msg=$(echo "$commit_msg_no_pr" | sed -E 's/^docs(\(.*\))?(:|[[:space:]])[[:space:]]*//I')
        formatted_msg="- 📝 ${content_msg}"; commit_type="other";
    elif [[ $commit_msg_no_pr =~ ^style(:|[[:space:]]|(\(.*\):)) ]]; then 
        content_msg=$(echo "$commit_msg_no_pr" | sed -E 's/^style(\(.*\))?(:|[[:space:]])[[:space:]]*//I')
        formatted_msg="- 💄 ${content_msg}"; commit_type="other";
    elif [[ $commit_msg_no_pr =~ ^refactor(:|[[:space:]]|(\(.*\):)) ]]; then 
        content_msg=$(echo "$commit_msg_no_pr" | sed -E 's/^refactor(\(.*\))?(:|[[:space:]])[[:space:]]*//I')
        formatted_msg="- ♻️ ${content_msg}"; commit_type="other";
    elif [[ $commit_msg_no_pr =~ ^test(:|[[:space:]]|(\(.*\):)) ]]; then 
        content_msg=$(echo "$commit_msg_no_pr" | sed -E 's/^test(\(.*\))?(:|[[:space:]])[[:space:]]*//I')
        formatted_msg="- ✅ ${content_msg}"; commit_type="other";
    # Translation detection (use the original message part)
    elif [[ $commit_msg_no_pr =~ [Tt]ranslat(e|ion|ions)|local(e|es)|i18n|[Cc]rowdin ]]; then 
        content_msg=$commit_msg_no_pr # Use full message for translation items
        formatted_msg="- 🔧 ${content_msg}"; commit_type="translation";
    # Fallback: Infer type from keywords using the original message part
    else
      content_msg=$commit_msg_no_pr # Ensure content_msg is set for fallbacks
      if [[ $commit_msg_no_pr =~ ^Add|^Create|^Implement|^Support ]]; then formatted_msg="- ✨ ${content_msg}"; commit_type="feature";
      elif [[ $commit_msg_no_pr =~ ^Fix|^Resolve|^Correct|improve|^Update ]]; then formatted_msg="- 🐛 ${content_msg}"; commit_type="fix";
      else formatted_msg="- 🔧 ${content_msg}"; commit_type="other"; # Default to wrench emoji
      fi
    fi
    shopt -u nocasematch # Turn off case-insensitivity

    # Trim leading/trailing whitespace from content_msg which might be left by sed
    # Note: The actual message used in formatted_msg might differ slightly depending on the block above
    # For consistency, we perhaps should trim formatted_msg *after* the PR link is added, or ensure content_msg is used consistently
    # For now, let's assume the main issue was the rebuild block below and remove it.

    # Ensure content_msg is not empty after potential prefix removal and trimming
    # We should check formatted_msg after construction instead, or the base content used.
    # Let's refine this check slightly
    check_content=${formatted_msg#-* } # Remove prefix like "- ✨ " to check actual message
    if [[ -z "$check_content" ]]; then
        # If message part is empty after processing, skip
        # echo "Warning: Skipping commit with empty message part: $commit_msg" >&2
        continue
    fi
    
    # Add PR link back if pr_num was found
    if [ -n "$pr_num" ]; then
       pr_link="([#$pr_num]($repo_url/pull/$pr_num))"
       # Append PR link to the formatted_msg
       formatted_msg="$formatted_msg $pr_link"
     fi

    # Add to appropriate array based on commit_type
    if [ "$commit_type" = "feature" ]; then features+=("$formatted_msg");
    elif [ "$commit_type" = "fix" ]; then fixes+=("$formatted_msg");
    elif [ "$commit_type" = "translation" ]; then translations+=("$formatted_msg");
    else others+=("$formatted_msg");
    fi

  done < <(echo "$commit_data") # Read from the variable containing log output


  # Only add version section if there are any categorized commits for this version
  if [ ${#features[@]} -gt 0 ] || [ ${#fixes[@]} -gt 0 ] || [ ${#translations[@]} -gt 0 ] || [ ${#others[@]} -gt 0 ]; then
    # Get the date of the current_tag
    tag_date=$(git log -1 --format=%ai "$current_tag" | cut -d' ' -f1)
    
    # Write the current_tag and date header
    echo "## $current_tag ($tag_date)" >> public/CHANGELOG.md

    # Write features, fixes, translations, others in order
    for msg in "${features[@]}"; do echo -e "$msg" >> public/CHANGELOG.md; done
    for msg in "${fixes[@]}"; do echo -e "$msg" >> public/CHANGELOG.md; done
    for msg in "${translations[@]}"; do echo -e "$msg" >> public/CHANGELOG.md; done
    for msg in "${others[@]}"; do echo -e "$msg" >> public/CHANGELOG.md; done
    
    # Add a newline after each version block for better spacing
    echo "" >> public/CHANGELOG.md 
  fi

  # Stop processing if we reach the point where history is manually maintained
  # Adjust this tag if the manual section changes
  if [ "$current_tag" == "v0.3.0" ]; then
      # echo "Reached v0.3.0, stopping git log processing." # Debugging/Info
      break # Exit the loop
  fi

done

# Append the hardcoded historical changelog entries for v0.2.0 and older
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

# Add footer
echo "" >> public/CHANGELOG.md
echo "*Changelog generated by \`scripts/generate-version.sh\`*" >> public/CHANGELOG.md

echo "Changelog generated successfully in public/CHANGELOG.md" 