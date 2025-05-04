#!/bin/sh

# set -u

# === CONFIG ===
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/node_package_mgr.log"
SILENT=false
PRETTIFY=true
ACTION=""
INSTALL_CMD="npm install"
DRY_RUN=true

# ANSI Colors
BLACK="$(printf '\033[0;30m')"
RED="$(printf '\033[0;31m')"
GREEN="$(printf '\033[0;32m')"
YELLOW="$(printf '\033[0;33m')"
BLUE="$(printf '\033[0;34m')"
PURPLE="$(printf '\033[0;35m')"
CYAN="$(printf '\033[0;36m')"
WHITE="$(printf '\033[0;37m')"
NC="$(printf '\033[0m')"

OUTDATED_ICON="🟥"
INCONSISTENCY_ICON="⚠️"

# Strip prettify if not TTY
[ ! -t 1 ] && PRETTIFY=false
[ "$PRETTIFY" = false ] && RED="" YELLOW="" NC="" OUTDATED_ICON="" INCONSISTENCY_ICON=""

# mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null
# : > "$LOG_FILE"

########################### GLOBAL SAFE EXIT HANDLER ###########################
REAL_IFS=$IFS
RESTORE_TERMINAL=false

safe_cleanup() {
	# Protection against CTRL+C
	IFS=$REAL_IFS
	if [ "$RESTORE_TERMINAL" = true ]; then
		stty echo
		printf "\n"
	fi
}

safe_exit_error() { safe_cleanup; exit 1; }
safe_exit_success() { safe_cleanup; exit 0; }

# Ignore broken pipe errors
trap '' PIPE
# Safe exit and set correct error code
trap 'safe_exit_error' INT TERM HUP
trap 'safe_exit_success' EXIT

############################### LOGGING FUNCTION ###############################
timestamp() { date "+%Y-%m-%d %H:%M:%S"; }

log() {
	[ "$SILENT" = false ] && printf "%s %s\n" "$(timestamp)" "$1"
	# printf "%s %s\n" "$(timestamp)" "$1" >> "$LOG_FILE"
	printf "%s %s\n" "$(timestamp) $1"
}

usage() {
	printf "Usage: %s [--install|--uninstall|--check] [--silent]\n" "$0"
	exit 1
}

install() {
	local_service_dir="$1"

	log "${CYAN}Installing in ${local_service_dir}${NC}"
	if [ "$DRY_RUN" = true ]; then
		log "🟡  Would run this: cd ${local_service_dir} && ${INSTALL_CMD}"
	else
		(cd "$local_service_dir" && $INSTALL_CMD) || log "${RED}❌ Failed in ${local_service_dir}${NC}"
	fi
}

uninstall() {
	local_service_dir="$1"

	log "${CYAN}Uninstalling in ${local_service_dir}${NC}"
	if [ "$DRY_RUN" = true ]; then
		log "🟡  Would run this: rm -rf ${local_service_dir}/node_modules ${local_service_dir}/package-lock.json"
	else
		rm -rf "${local_service_dir}/node_modules" "${local_service_dir}/package-lock.json" || log "${RED}❌ Failed in ${local_service_dir}${NC}"
	fi
}

find_services() {
	find "$PROJECT_ROOT" -path '*/node_modules/*' -prune -o -type f -name "package.json" ! -path "$PROJECT_ROOT/package.json" | while IFS= read -r pkgfile; do
		service_dir="$(dirname "$pkgfile")"
		case "$ACTION" in
			install) install "$service_dir" ;;
			uninstall) uninstall "$service_dir" ;;
		esac
	done
}

handle_root() {
	if [ -f "$PROJECT_ROOT/package.json" ]; then
		case "$ACTION" in
			install)
				log "${CYAN}Installing root dependencies${NC}"
				install "$PROJECT_ROOT"
				;;
			uninstall)
				log "${CYAN}Uninstalling root node_modules${NC}"
				uninstall "$PROJECT_ROOT"
				;;
		esac
	else
		root_folder="$(basename "$PROJECT_ROOT")"
		log "${YELLOW}No package.json found in root ${root_folder}${NC}"
	fi
}

check_versions() {
	log "${BLUE}Checking package versions...${NC}"
	# temp file
	tmpfile="$(mktemp)"
	find "$PROJECT_ROOT" -path '*/node_modules/*' -prune -o -type f -name "package.json" | while IFS= read -r json_path; do
		service_path="${json_path#$PROJECT_ROOT/}"
		service_dir="$(dirname "$service_path")"

		for section in dependencies devDependencies; do
			jq -r "try .$section // empty | to_entries[] | \"\(.key) \(.value) $service_dir $section\"" "$json_path" >> "$tmpfile"
		done
	done

	sort "$tmpfile" | cut -d' ' -f1 | uniq | while IFS= read -r package; do
		grep "^$package " "$tmpfile" > "$tmpfile.pkg"
		count="$(cut -d' ' -f2 "$tmpfile.pkg" | sort -u | wc -l | tr -d ' ')"
		sections="$(cut -d' ' -f4 "$tmpfile.pkg" | sort -u | tr '\n' ',' | sed 's/,$//')"
		log "${GREEN}├── ${package}${NC}"

		while IFS= read -r line; do
			pkg ver svc sec=$(printf "%s" "$line")
			pkg="$(echo "$line" | cut -d' ' -f1)"
			ver="$(echo "$line" | cut -d' ' -f2)"
			svc="$(echo "$line" | cut -d' ' -f3)"
			sec="$(echo "$line" | cut -d' ' -f4)"

			warning=""
			[ "$count" -gt 1 ] && warning="${RED}${OUTDATED_ICON}${NC} (older!)"
			echo "$sections" | grep -q "dependencies,devDependencies" && warning="${YELLOW}${INCONSISTENCY_ICON}${NC} (inconsistent section)"

			log "│   ├── ${svc} → ${ver} ${warning}"
		done < "$tmpfile.pkg"

		log ""
		rm -f "$tmpfile.pkg"
	done
	rm -f "$tmpfile"
	log "${BLUE}✅ Version check complete.${NC}"
}

for arg in "$@"; do
	case "$arg" in
		-i|--install) ACTION="install" ;;
		-u|--uninstall) ACTION="uninstall" ;;
		-c|--check) ACTION="check" ;;
		-s|--silent) SILENT=true ;;
		-h|--help) usage ;;
		--dry-run) DRY_RUN=true ;;
		*) printf "Unknown option: %s\n" "$arg"; usage ;;
	esac
done

if [ -z "$ACTION" ]; then
	printf "%s\n%s\n%s\n%s" \
		"What do you want to do?" \
		"1) Install all node packages" \
		"2) Uninstall all node packages" \
		"3) Check for version mismatches"
	printf "\nEnter choice [1-3]: "
	IFS= read -r choice < /dev/tty
	case "$choice" in
		1) ACTION="install" ;;
		2) ACTION="uninstall" ;;
		3) ACTION="check" ;;
		*) printf "Invalid choice\n"; exit 1 ;;
	esac
fi

case "$ACTION" in
	check) check_versions ;;
	install|uninstall)
		handle_root
		find_services
		log "${GREEN}✅ Done: $ACTION completed.${NC}"
		;;
esac
