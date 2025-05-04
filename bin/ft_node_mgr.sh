#!/bin/sh

# set -u

################################## CONSTANTS ###################################
# === CONFIG ===
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="/tmp/transcendence"
LOG_FILE="$LOG_DIR/node_package_mgr.log"
SILENT=false                      # Enables/Disables output to the terminal
PRETTIFY=true                     # Global toggle to disable colors & icons (false means you're not cool)
INSTALL_CMD="npm install"
DRY_RUN=true                     # Required by '--dry-run' flag. Simulates script behavior but without real operations execution
LOG_ENABLED=false                  # Enables/Disables writing to log file. terminal output is not affected
ENABLE_TIMESTAMP=false            # Globally enable/disable timestamp %Y-%m-%d %H:%M:%S 

# === CONSTANT INITIALIZATION ===
ACTION=""

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

# mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null
# : > "$LOG_FILE"

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

############################ LOGGING ############################
# Strip prettify if not TTY
[ ! -t 1 ] && PRETTIFY=false
[ "$PRETTIFY" = false ] && RED="" YELLOW="" NC="" OUTDATED_ICON="" INCONSISTENCY_ICON=""

timestamp() { date "+%Y-%m-%d %H:%M:%S"; }

log() {
	msg="$(printf "%s %s" "$(timestamp)" "$1")"
	[ "$SILENT" = false ] && printf "%s\n" "$msg"
	if [ "$LOG_ENABLED" = true ]; then
		mkdir -p "$LOG_DIR"
		printf "%s\n" "$(printf "%s" "$msg" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | sed 's/⚠️//g; s/🟥//g')" >> "$LOG_FILE"
	fi
}

########################### CORE OPS ###########################
install() {
	local_dir="$1"
	rel_path="${local_dir#$PROJECT_ROOT/}"
	[ "$rel_path" = "$local_dir" ] && rel_path="."
	log "${CYAN}Installing in ${rel_path}${NC}"
	if [ "$DRY_RUN" = true ]; then
		log "🟡  Would run this: cd ${rel_path} && ${INSTALL_CMD}"
	else
		(cd "$local_dir" && $INSTALL_CMD) || log "${RED}❌ Failed in ${rel_path}${NC}"
	fi
}

uninstall() {
	local_dir="$1"
	rel_path="${local_dir#$PROJECT_ROOT/}"
	[ "$rel_path" = "$local_dir" ] && rel_path="."
	log "${CYAN}Uninstalling in ${rel_path}${NC}"
	if [ "$DRY_RUN" = true ]; then
		log "🟡  Would run this: rm -rf ${rel_path}/node_modules ${rel_path}/package-lock.json"
	else
		rm -rf "${local_dir}/node_modules" "${local_dir}/package-lock.json" || log "${RED}❌ Failed in ${rel_path}${NC}"
	fi
}

find_services() {
	log "${CYAN}🔧 Microservice Dependencies${NC}"
	find "$PROJECT_ROOT" -path '*/node_modules/*' -prune -o -type f -name "package.json" ! -path "$PROJECT_ROOT/package.json" -print |
	while IFS= read -r pkgfile; do
		service_dir="$(dirname "$pkgfile")"
		case "$ACTION" in
			install) install "$service_dir" ;;
			uninstall) uninstall "$service_dir" ;;
		esac
	done
}

handle_root() {
	if [ -f "$PROJECT_ROOT/package.json" ]; then
		log "${CYAN}🔧 Root Dependencies${NC}"
		case "$ACTION" in
			install) install "$PROJECT_ROOT" ;;
			uninstall) uninstall "$PROJECT_ROOT" ;;
		esac
	else
		log "${YELLOW}No package.json found in project root${NC}"
	fi
}

check_versions() {
	log "${BLUE}Checking package versions...${NC}"
	# temp file
	tmpfile="$(mktemp)"
	find "$PROJECT_ROOT" -path '*/node_modules/*' -prune -o -type f -name "package.json" -print |
	while IFS= read -r json_path; do
		service_path="${json_path#$PROJECT_ROOT/}"
		service_dir="$(dirname "$service_path")"
		for section in dependencies devDependencies; do
			jq -r "try .$section // empty | to_entries[] | \"\(.key) \(.value) $service_dir $section\"" "$json_path" >> "$tmpfile"
		done
	done

	for section in dependencies devDependencies; do
		log ""
		log "${PURPLE}########################### ${section} ####################################${NC}"
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

########################### ARG PARSING ###########################
for arg in "$@"; do
	case "$arg" in
		-i|--install) ACTION="install" ;;
		-u|--uninstall) ACTION="uninstall" ;;
		-c|--check) ACTION="check" ;;
		-s|--silent) SILENT=true ;;
		--log) LOG_ENABLED=true ;;
		--dry-run) DRY_RUN=true ;;
		-h|--help)
			printf "Usage: %s [--install|--uninstall|--check] [--log] [--silent] [--dry-run]\n" "$0"
			exit 0
			;;
		*) printf "Unknown option: %s\n" "$arg"; exit 1 ;;
	esac
done

if [ -z "$ACTION" ]; then
	printf "%s\n%s\n%s\n%s" \
		"What do you want to do?" \
		"I ) Install all node packages" \
		"U ) Uninstall all node packages" \
		"C ) Check for version mismatches"
	printf "\nEnter choice [I/U/C]: "
	IFS= read -r choice < /dev/tty
	case "$choice" in
		I|i) ACTION="install" ;;
		U|u) ACTION="uninstall" ;;
		C|c) ACTION="check" ;;
		*) printf "Invalid choice\n"; exit 1 ;;
	esac
fi

# === MAIN ===
case "$ACTION" in
	check) check_versions ;;
	install|uninstall)
		handle_root
		find_services
		log "${GREEN}✅ Done: $ACTION completed.${NC}"
		;;
esac
