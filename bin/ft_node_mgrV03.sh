#!/bin/sh

set -u

##################### UTILITY FUNCTIONS FOR CONSTS AND VARS ####################
resolve_path() {
	# Returns the canonical absolute path of the given argument
	# Usage: resolved=$(resolve_path "./some/path")
	if command -v realpath >/dev/null 2>&1; then
		realpath "${1}"
	else
		# POSIX-safe fallback if realpath is unavailable
		( cd "${1}" && pwd )
		# If need to suppress cd error messages, use below version
		# ( cd "${1}" 2>/dev/null && pwd )
	fi
}

################################## CONSTANTS ###################################
# === PATHS & BOUNDARIES ===
# PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)" # Fails if symbolic sink
# PROJECT_ROOT="$(realpath "$(cd "$(dirname "$0")/.." && pwd)")" # Fails if realpath is not installed
PROJECT_ROOT="$(resolve_path "$(dirname "$0")/..")"
TRASH_DIR="/tmp/transcendence"
LOCK_TRASH_DIR="$TRASH_DIR/package_lock"
PKG_TRASH_DIR="$TRASH_DIR/package"
LOG_FILE="$TRASH_DIR/node_package_mgr.log"

# === DEFAULT BEHAVIORS ===
SILENT=false                      # Enables/Disables output to the terminal
PRETTIFY=true                     # Global toggle to disable colors & icons (false means you're not cool)
DRY_RUN=true                      # Required by '--dry-run' flag. Simulates script behavior but without real operations execution
LOG_ENABLED=true                  # Enables/Disables writing to log file. terminal output is not affected
ENABLE_TIMESTAMP=false            # Globally enable/disable timestamp %Y-%m-%d %H:%M:%S 
DEFAULT_KEEP_MODE="add-path-timestamp" # Options: overwrite, add-path, add-path-timestamp

# === COMMANDS AND FLAGS ===
INSTALL_CMD_1="npm install"
INSTALL_CMD_2="npm ci"

# === CONSTANT INITIALIZATION ===
ACTION=""
TARGET_DIR="$PROJECT_ROOT"

# === ANSI Colors ===
BLACK="$(printf '\033[0;30m')"
RED="$(printf '\033[0;31m')"
GREEN="$(printf '\033[0;32m')"
YELLOW="$(printf '\033[0;33m')"
BLUE="$(printf '\033[0;34m')"
PURPLE="$(printf '\033[0;35m')"
CYAN="$(printf '\033[0;36m')"
WHITE="$(printf '\033[0;37m')"
NC="$(printf '\033[0m')"

# === Custom formatting ===
OUTDATED_ICON="🟥"
INCONSISTENCY_ICON="⚠️"
# OUTDATED_ICON="\xf7" #🟥
# INCONSISTENCY_ICON="\xe1" #⚠️

########################### GLOBAL SAFE EXIT HANDLER ###########################
REAL_IFS=$IFS
RESTORE_TERMINAL=false

safe_cleanup() {
	# Protection against CTRL+C
	IFS=$REAL_IFS
	[ "$RESTORE_TERMINAL" = true ] && stty echo && printf "\n"
}

safe_exit_error() { safe_cleanup; exit 1; }
safe_exit_success() { safe_cleanup; exit 0; }

# Ignore broken pipe errors
trap '' PIPE
# Safe exit and set correct error code
trap 'safe_exit_error' INT TERM HUP
trap 'safe_exit_success' EXIT

### HELPERS
is_yes() {
	case "$1" in
		[yY] | [yY][eE][sS] | "") return 0 ;;
		*) return 1 ;;
	esac
}

prompt_yes_no() {
	local_prompt_msg="$1"
	local_default_ans="$2"
	local_default_display="y/N"
	[ "$local_default_ans" = "y" ] && local_default_display="Y/n"
	while true; do
		printf "%s [%s]: " "$local_prompt_msg" "$local_default_display"
		if ! IFS= read -r local_prompt_reply < /dev/tty; then
			local_prompt_reply="$local_default_ans"
		fi
		local_prompt_reply="${local_prompt_reply#"${local_prompt_reply%%[![:space:]]*}"}"
		local_prompt_reply="${local_prompt_reply%"${local_prompt_reply##*[![:space:]]}"}"
		local_prompt_reply="${local_prompt_reply:-$local_default_ans}"
		if is_yes "$local_prompt_reply"; then return 0
		else case "$local_prompt_reply" in
			[nN]|[nN][oO]) return 1 ;;
			*) printf "Please answer yes or no.\n" ;;
		esac
		fi
	done
}

sanitize_path() {
	echo "$1" | sed 's/\//_/g'
}

timestamp() { [ "$ENABLE_TIMESTAMP" = true ] && date "+%Y-%m-%d %H:%M:%S"; }

log() {
	msg="$(printf "%s %s" "$(timestamp)" "$1")"
	[ "$SILENT" = false ] && printf "%s\n" "$msg"
	if [ "$LOG_ENABLED" = true ]; then
		# Create folder if not exists
		mkdir -p "$TRASH_DIR"
		printf "%s\n" "$(printf "%s" "$msg" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | sed 's/⚠️//g; s/🟥//g')" >> "$LOG_FILE"
		# printf "%s\n" "$(printf "%s" "$msg" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | sed 's/[\xf7\xe1]//g')" >> "$LOG_FILE"
	fi
}

# TODO: I think dry-run logic here is reverse
backup_file() {
	file="$1"
	base="$(basename "$file")"
	rel_path="${file#$PROJECT_ROOT/}"
	mkdir -p "$PKG_TRASH_DIR"
	case "$DEFAULT_KEEP_MODE" in
		overwrite) dest="$PKG_TRASH_DIR/$base" ;;
		add-path) dest="$PKG_TRASH_DIR/$(sanitize_path "$rel_path")" ;;
		add-path-timestamp) dest="$PKG_TRASH_DIR/$(sanitize_path "$rel_path")_$(date +%Y%m%d%H%M%S)" ;;
	esac
	[ "$DRY_RUN" = true ] && log "🟡  Would back up: $file to $dest" || cp "$file" "$dest"
}

### CORE OPS
install() {
	local_dir="$1"
	[ -f "$local_dir/package-lock.json" ] && INSTALL_CMD="$INSTALL_CMD_2" || INSTALL_CMD="$INSTALL_CMD_1"
	rel_path="${local_dir#$PROJECT_ROOT/}"
	[ "$rel_path" = "$local_dir" ] && rel_path="."

	if prompt_yes_no "Sanitize before install in ${rel_path}?" "n"; then
		sanitize_versions "$local_dir" -only-this
	fi

	log "${CYAN}Installing in ${rel_path}${NC}"
	if [ "$DRY_RUN" = true ]; then
		log "🟡  Would run this: cd ${rel_path} && ${INSTALL_CMD}"
	else
		(cd "$local_dir" && $INSTALL_CMD) || log "${RED}❌ Failed in ${rel_path}${NC}"
	fi
}

# TODO: Change prompt logic to soft uninstall first
uninstall() {
	local_dir="$1"
	rel_path="${local_dir#$PROJECT_ROOT/}"
	[ "$rel_path" = "$local_dir" ] && rel_path="."

	if prompt_yes_no "Hard uninstall for ${rel_path}?" "n"; then
		mode="h"
	else
		mode="s"
	fi

	log "${CYAN}Uninstalling in ${rel_path}${NC}"
	if [ "$DRY_RUN" = true ]; then
		log "🟡  Would run this: rm -rf ${rel_path}/node_modules"
		[ "$mode" = h ] && log "🟡  Would also move package-lock.json to trash"
	else
		rm -rf "$local_dir/node_modules"
		if [ "$mode" = h ] && [ -f "$local_dir/package-lock.json" ]; then
			rel_path_lock="${local_dir#$PROJECT_ROOT/}/package-lock.json"
			case "$DEFAULT_KEEP_MODE" in
				overwrite) dest="$LOCK_TRASH_DIR/package-lock.json" ;;
				add-path) dest="$LOCK_TRASH_DIR/$(sanitize_path "$rel_path_lock")" ;;
				add-path-timestamp) dest="$LOCK_TRASH_DIR/$(sanitize_path "$rel_path_lock")_$(date +%Y%m%d%H%M%S)" ;;
			esac
			mkdir -p "$LOCK_TRASH_DIR"
			mv "$local_dir/package-lock.json" "$dest"
		fi
	fi
}

# TODO: Does this have protection against CTRL+C or CTRL+D ?
sanitize_versions() {
	dir="${1:-$TARGET_DIR}"
	scope="${2:-}"

	while :; do
		printf "What do you want to do with version symbols? [replace/remove/lock]: "
		IFS= read -r action < /dev/tty
		case "$action" in
			lock) symbol='[\^~]'; replacement=''; break ;;
			replace|remove) break ;;
			*) printf "Invalid action.\n" ;;
		esac
	done

	if [ "$action" != "lock" ]; then
		while :; do
			printf "Target symbol to modify (^ or ~): "
			IFS= read -r symbol < /dev/tty
			case "$symbol" in
				'^'|'~') break ;;
				*) printf "Invalid symbol.\n" ;;
			esac
		done
		if [ "$action" = replace ]; then
			[ "$symbol" = '^' ] && replacement='~' || replacement='^'
		else
			replacement=''
		fi
	fi

	if [ "$scope" = "-only-this" ]; then
		pkgfile="$dir/package.json"
		[ -f "$pkgfile" ] || return
		backup_file "$pkgfile"
		[ "$DRY_RUN" = true ] && log "🟡  Would sanitize $pkgfile" || \
			sed -i "s/\"$symbol/\"$replacement/g" "$pkgfile"
	else
		find "$dir" -path '*/node_modules/*' -prune -o -type f -name "package.json" -print |
		while IFS= read -r pkgfile; do
			backup_file "$pkgfile"
			[ "$DRY_RUN" = true ] && log "🟡  Would sanitize $pkgfile" || \
			sed -i "s/\"$symbol/\"$replacement/g" "$pkgfile"
		done
	fi
}

find_services() {
	log "${CYAN}🔧 Microservice Dependencies${NC}"
	find "$TARGET_DIR" -path '*/node_modules/*' -prune -o -type f -name "package.json" ! -path "$PROJECT_ROOT/package.json" -print |
	while IFS= read -r pkgfile; do
		service_dir="$(dirname "$pkgfile")"
		case "$ACTION" in
			install) install "$service_dir" ;;
			uninstall) uninstall "$service_dir" ;;
		esac
	done
}

handle_root() {
	if [ -f "$TARGET_DIR/package.json" ]; then
		log "${CYAN}🔧 Root Dependencies${NC}"
		case "$ACTION" in
			install) install "$TARGET_DIR" ;;
			uninstall) uninstall "$TARGET_DIR" ;;
		esac
	else
		log "${YELLOW}No package.json found in project root${NC}"
	fi
}

check_versions() {
	log "${BLUE}Checking package versions...${NC}"
	tmpfile="$(mktemp)"
	find "$TARGET_DIR" -path '*/node_modules/*' -prune -o -type f -name "package.json" -print |
	while IFS= read -r json_path; do
		service_path="${json_path#$PROJECT_ROOT/}"
		service_dir="$(dirname "$service_path")"
		for section in dependencies devDependencies; do
			jq -r "try .$section // empty | to_entries[] | \"\(.key) \(.value) $service_dir $section\"" "$json_path" >> "$tmpfile"
		done
	done

	for section in dependencies devDependencies; do
		log ""
		log "${PURPLE}### ${section} ###${NC}"
		cut -d' ' -f1,4 "$tmpfile" | grep " $section\$" | cut -d' ' -f1 | sort -u |
		while IFS= read -r package; do
			grep "^$package " "$tmpfile" | grep " $section\$" > "$tmpfile.pkg"
			all_versions="$(cut -d' ' -f2 "$tmpfile.pkg" | sort -u)"
			newest_ver="$(echo "$all_versions" | sort -Vr | head -n1)"
			dual_section=$(grep "^$package " "$tmpfile" | cut -d' ' -f4 | sort -u | wc -l)

			log "${GREEN}├── ${package}${NC}"
			while IFS=' ' read -r pkg ver svc sec; do
				warning=""
				[ "$dual_section" -gt 1 ] && warning="${YELLOW}${INCONSISTENCY_ICON}${NC} (mismatch!)"
				[ "$ver" != "$newest_ver" ] && warning="$warning ${RED}${OUTDATED_ICON}${NC} (older!)"
				log "│   ├── ${svc} → ${ver} ${warning}"
			done < "$tmpfile.pkg"
			log ""
			rm -f "$tmpfile.pkg"
		done
	done
	rm -f "$tmpfile"
	log "${BLUE}✅ Version check complete.${NC}"
}

### ARG PARSING
for arg in "$@"; do
	case "$arg" in
		-i|--install) ACTION="install" ;;
		-u|--uninstall) ACTION="uninstall" ;;
		-c|--check) ACTION="check" ;;
		-s|--sanitize) ACTION="sanitize" ;;
		-t|--target=*) TARGET_DIR="${arg#*=}" ;;
		--silent) SILENT=true ;;
		--log) LOG_ENABLED=true ;;
		--dry-run) DRY_RUN=true ;;
		*) printf "Unknown option: %s\n" "$arg"; exit 1 ;;
	esac
	shift
done

# TODO: Create a choose_action function
if [ -z "$ACTION" ]; then
	printf "%s\n%s\n%s\n%s\n%s\n" \
		"What do you want to do?" \
		"I ) Install all node packages" \
		"U ) Uninstall all node packages" \
		"C ) Check for version mismatches" \
		"S ) Sanitize package.json files" \
		"T ) Targeted operation mode"
	printf "Enter choice [I/U/C/S/T]: "
	IFS= read -r choice < /dev/tty
	case "$choice" in
		I|i) ACTION="install" ;;
		U|u) ACTION="uninstall" ;;
		C|c) ACTION="check" ;;
		S|s) ACTION="sanitize" ;;
		T|t)
			printf "Enter target directory (relative to project root or absolute): "
			IFS= read -r raw_target < /dev/tty
			if [ -d "${raw_target}" ]; then
				# TARGET_DIR="$(cd "$raw_target" && pwd)"
				# TARGET_DIR="$(realpath "${raw_target}")"
				TARGET_DIR="$(resolve_path "${raw_target}")"
			elif [ -d "${PROJECT_ROOT}/${raw_target}" ]; then
				# TARGET_DIR="$(cd "$PROJECT_ROOT/$raw_target" && pwd)"
				# TARGET_DIR="$(realpath "${PROJECT_ROOT}/${raw_target}")"
				TARGET_DIR="$(resolve_path "${PROJECT_ROOT}/${raw_target}")"
			else
				printf "PROJECT_ROOT: %s\n" "${PROJECT_ROOT}"
				printf "TARGET_DIR: %s\n" "${TARGET_DIR}"
				printf "raw_target: %s\n" "${raw_target}"
				printf "Target directory does not exist: %s\n" "${raw_target}"
				exit 1
			fi

			printf "%s\n%s\n%s\n%s\n" \
				"What do you want to do in target?" \
				"I ) Install all node packages" \
				"U ) Uninstall all node packages" \
				"C ) Check for version mismatches" \
				"S ) Sanitize package.json files"
			printf "Enter choice [I/U/C/S]: "
			IFS= read -r subchoice < /dev/tty
			case "${subchoice}" in
				I|i) ACTION="install" ;;
				U|u) ACTION="uninstall" ;;
				C|c) ACTION="check" ;;
				S|s) ACTION="sanitize" ;;
				*) printf "Invalid action\n"; exit 1 ;;
			esac
			;;
		*) printf "Invalid choice\n"; exit 1 ;;
	esac
fi

# === MAIN ===
# Print execution start (logfile separation for easier location)
# Create folder if not exists
mkdir -p "$TRASH_DIR"
printf "%s\n" "### EXECUTION STARTED ###" >> "$LOG_FILE"

case "$ACTION" in
	check) check_versions ;;
	sanitize) sanitize_versions ;;
	install|uninstall)
		handle_root
		find_services
		log "${GREEN}✅ Done: $ACTION completed.${NC}"
		;;
esac
