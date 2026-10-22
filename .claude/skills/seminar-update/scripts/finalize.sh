#!/usr/bin/env bash
# Irreversible steps of a seminar update: revert incidental files, commit the series files,
# push the branch, open the pull request. Run only after the user approved the review.
# Usage, from the repository root:
#   .claude/skills/seminar-update/scripts/finalize.sh SERIES_ID COMMIT_MESSAGE_FILE "PR TITLE" PR_BODY_FILE
set -euo pipefail

series=${1:?series id}
message_file=${2:?commit message file}
pr_title=${3:?pull request title}
pr_body_file=${4:?pull request body file}
here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

root=$(git rev-parse --show-toplevel); cd "$root"
branch=$(git branch --show-current)
case "$branch" in
    main|master|"") echo "refusing to finalize on '$branch'; run the preflight to create an update branch"; exit 1 ;;
    */"$series"-update-[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]) ;;
    *) echo "refusing to finalize on '$branch': not an update branch for $series"; exit 1 ;;
esac
[ -f "$message_file" ] || { echo "commit message file not found: $message_file"; exit 1; }
[ -f "$pr_body_file" ] || { echo "pull request body file not found: $pr_body_file"; exit 1; }

mapfile -t expected < <(node "$here/summarise_diff.mjs" "$series" --files)

# Revert every modified tracked file outside the expected set.
git reset --quiet
while IFS= read -r file; do
    [ -z "$file" ] && continue
    keep=false; for e in "${expected[@]}"; do [ "$file" = "$e" ] && keep=true; done
    if ! $keep; then git checkout --quiet -- "$file"; echo "reverted incidental change: $file"; fi
done < <(git diff --name-only)

for e in "${expected[@]}"; do [ -f "$e" ] && git add -- "$e"; done
[ -n "$(git diff --cached --name-only)" ] || { echo "nothing to commit for $series"; exit 1; }
echo "committing:"; git diff --cached --name-only | sed 's/^/  /'

git commit --quiet -F "$message_file"
git push --quiet -u origin "$branch"
url=$(gh pr create --base main --head "$branch" --title "$pr_title" --body-file "$pr_body_file")
echo "commit $(git rev-parse --short HEAD) on $branch"
echo "pull request: $url"
