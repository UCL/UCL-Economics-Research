#!/usr/bin/env bash
# Preflight for a seminar schedule update. Read-only, except that it fast-forwards main
# when main is behind origin and, at the end, creates and checks out the update branch.
# Usage, from the repository root:
#   .claude/skills/seminar-update/scripts/preflight.sh SERIES_ID [--owner NAME] [--date YYYY-MM-DD] [--no-branch]
set -uo pipefail

series=${1:?series id (an id from seminars/config/series.json)}; shift
owner=$(git config seminar-update.owner 2>/dev/null || true)
[ -n "$owner" ] || owner=$(git config user.name 2>/dev/null | awk '{print tolower($1)}')
today=$(date +%F)
make_branch=true
while [ $# -gt 0 ]; do
    case $1 in
        --owner) owner=$2; shift 2 ;;
        --date) today=$2; shift 2 ;;
        --no-branch) make_branch=false; shift ;;
        *) echo "unknown argument: $1"; exit 2 ;;
    esac
done
branch="$owner/$series-update-$today"

status=0
pass() { printf 'PASS  %s\n' "$1"; }
hint() { [ -n "${1:-}" ] && printf '      %s\n' "$1"; return 0; }
fail() { printf 'FAIL  %s\n' "$1"; hint "${2:-}"; status=1; }
info() { printf 'INFO  %s\n' "$1"; hint "${2:-}"; }
check() { # check "name" "failure hint" command...
    local name=$1 hint=$2; shift 2
    if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name" "$hint"; fi
}

# 1. Repository and remote.
check "inside a git repository" "" git rev-parse --is-inside-work-tree
check "remote origin exists" "" git remote get-url origin
check "fetch --prune origin" "network or credentials" git fetch --quiet --prune origin
root=$(git rev-parse --show-toplevel 2>/dev/null) || root=.
cd "$root" || exit 1

# 2. Tooling.
if node_version=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null) && [ "$node_version" -ge 18 ]; then
    pass "node $node_version available"
else fail "node 18 or newer available" "install Node.js"; fi
[ -d node_modules/exceljs ] && pass "data-script dependencies installed" || fail "data-script dependencies installed" "npm install (repository root)"
check "gh is authenticated" "gh auth login" gh auth status

# 3. Series.
if [ -z "$owner" ]; then fail "branch owner known" "git config user.name is empty; pass --owner"; fi
if node -e '
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("seminars/config/series.json", "utf8"));
process.exit(config.some(s => s.id === process.argv[1]) ? 0 : 1);
' "$series" 2>/dev/null; then pass "series exists in config: $series"
else fail "series exists in config: $series" "ids: $(node -e 'console.log(JSON.parse(require("fs").readFileSync("seminars/config/series.json","utf8")).map(s=>s.id).join(", "))' 2>/dev/null)"; fi

# 4. Branch state.
current=$(git branch --show-current)
[ "$current" = main ] && pass "main is checked out" || fail "main is checked out (on $current)" "git checkout main"
if [ -z "$(git status --porcelain)" ]; then pass "working tree clean"
else fail "working tree clean" "$(git status --porcelain | head -5 | tr '\n' ';')"; fi

# 5. main against origin: equal or behind (fast-forwarded) only.
local_tip=$(git rev-parse refs/heads/main 2>/dev/null)
remote_tip=$(git rev-parse refs/remotes/origin/main 2>/dev/null)
if [ -z "$local_tip" ] || [ -z "$remote_tip" ]; then fail "main exists locally and on origin" ""
elif [ "$local_tip" = "$remote_tip" ]; then pass "main is in sync with origin"
elif git merge-base --is-ancestor "$local_tip" "$remote_tip"; then
    if [ "$current" = main ] && [ "$status" -eq 0 ] && git pull --quiet --ff-only origin main >/dev/null 2>&1; then
        info "main was behind origin and has been fast-forwarded" "now at $(git rev-parse --short HEAD)"
    else fail "main is behind origin" "git checkout main && git pull --ff-only origin main"; fi
elif git merge-base --is-ancestor "$remote_tip" "$local_tip"; then fail "main is ahead of origin" "unpushed commits on main; move them to a branch first"
else fail "main has diverged from origin" "reconcile before updating"; fi

# 6. Update branch name is free.
git show-ref --verify --quiet "refs/heads/$branch" && fail "branch name free locally: $branch" "git branch -d $branch, or pass --date" || pass "branch name free locally: $branch"
git show-ref --verify --quiet "refs/remotes/origin/$branch" && fail "branch name free on origin: $branch" "pass --date" || pass "branch name free on origin: $branch"

if [ "$status" -ne 0 ]; then echo "PREFLIGHT FAILED"; exit 1; fi
if $make_branch; then
    git checkout --quiet -b "$branch" || { fail "create branch $branch" ""; echo "PREFLIGHT FAILED"; exit 1; }
    pass "created and checked out $branch"
fi
echo "PREFLIGHT PASSED"
echo "BRANCH $branch"
