#!/bin/sh

set -u

################################## CONSTANTS ###################################
# === PATHS & BOUNDARIES ===
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="/tmp/transcendence"
LOG_FILE="$LOG_DIR/node_package_mgr.log"

# === DEFAULT BEHAVIORS ===
SILENT=false                      # Enables/Disables output to the terminal
PRETTIFY=true                     # Global toggle to disable colors & icons (false means you're not cool)
DRY_RUN=true                     # Required by '--dry-run' flag. Simulates script behavior but without real operations execution
LOG_ENABLED=true                  # Enables/Disables writing to log file. terminal output is not affected
ENABLE_TIMESTAMP=false            # Globally enable/disable timestamp %Y-%m-%d %H:%M:%S 

# === COMMANDS AND FLAGS ===
INSTALL_CMD="npm install"

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

############################# USER GUIDE FUNCTION ##############################
# Helper function for print_help()
_help_print() {
	# Safety check (If $1 provided via script's flag is not "full" AND not "base", then exit early)
	[ "$1" = "full" ] || [ "$1" = "base" ] || return
	# Save "1st" argument: Selected mode provided via script's flags (e.g: full)
	local_help_mode="$1"
	# Shift to the next argument
	shift
	# Save "2nd" argument: Required mode to print the line (e.g: base)(defaults to base)
	local_required_mode="${1:-base}"
	# Shift to the next argument
	shift
	# Check required printing mode: if "base" OR script's flag = required print mode (if yes, print; if no, exit)
	[ "$local_required_mode" = "base" ] || [ "$local_help_mode" = "$local_required_mode" ] || return
	printf "%s\n" "$@"
}

print_help() {
	local_help_flag="$1"
	_help_print "$local_help_flag" full "################################################################################"
	_help_print "$local_help_flag" full "#             ft_transcendence Node Package Manager Script - Help              #"
	_help_print "$local_help_flag" full "################################################################################"
	_help_print "$local_help_flag" base ""
	_help_print "$local_help_flag" base "Usage:"
	_help_print "$local_help_flag" base "  $(basename "$0") [options]"
	_help_print "$local_help_flag" base ""
	_help_print "$local_help_flag" base "Options:"
	_help_print "$local_help_flag" base "  -i, --install            Install all node packages used in the project"
	_help_print "$local_help_flag" base "  -u, --uninstall          Uninstall all node packages used in the project"
	_help_print "$local_help_flag" base "  -c, --check              Force execution/overwrite without asking confirmation"
	_help_print "$local_help_flag" base "  -s, --silent             Checks package.json files for versions, version mismatches and placement (Dependencies / devDependencies)"
	_help_print "$local_help_flag" base "      --log                Logs script execution messages. Terminal output is not affected"
	_help_print "$local_help_flag" base "      --dry-run            Simulates script execution (good for learning and testing)"
	_help_print "$local_help_flag" base "  -h, --help[=full]        Show this help message and exit.  Show full help if called: $(basename "$0") --help=full"
	_help_print "$local_help_flag" base ""
	_help_print "$local_help_flag" full "Description:"
	_help_print "$local_help_flag" full "  This script is for managing Node packages. It installs, uninstalls and checks the packages used in the project."
	_help_print "$local_help_flag" full "  Its purpose is automate packages installs/uninstalls; so the code can be reviewed without error messages (red squiggly underline)."
	_help_print "$local_help_flag" full "  This also allows to run the project locally (no containerization) to some extent."
	_help_print "$local_help_flag" full "  The script automatically detects the project root via the constant PROJECT_ROOT."
	_help_print "$local_help_flag" full ""
	_help_print "$local_help_flag" full "Install:"
	_help_print "$local_help_flag" full "  The script uses this command for installing packages: $INSTALL_CMD"
	_help_print "$local_help_flag" full "  It first install the packages in project root's package.json"
	_help_print "$local_help_flag" full "  Then it recursively locates package.json file in subfolders and installs them."
	_help_print "$local_help_flag" full ""
	_help_print "$local_help_flag" full "Uninstall:"
	_help_print "$local_help_flag" full "  The script uses these commands for uninstall packages: rm -rf node_modules package-lock.json"
	_help_print "$local_help_flag" full "  It first uninstall the packages from project root's package.json"
	_help_print "$local_help_flag" full "  Then it recursively locates package.json file in subfolders and uninstalls them."
	_help_print "$local_help_flag" full ""
	_help_print "$local_help_flag" full "Check:"
	_help_print "$local_help_flag" full "  The script builds a package-tree of all Node packages used in the project."
	_help_print "$local_help_flag" full "  It parse each package.json file and builds an alphabetically ordered list tree with this info:"
	_help_print "$local_help_flag" full "  1. Location Header: Dependencies / devDependencies"
	_help_print "$local_help_flag" full "    2. Package name"
	_help_print "$local_help_flag" full "      3. Folder where the package is found and the package's version"
	_help_print "$local_help_flag" full "      4. It appends [(mismatch!) | (older!)] according to the following criteria:"
	_help_print "$local_help_flag" full "        4.1 (mismatch!): If the package is found in BOTH Dependencies AND devDependencies"
	_help_print "$local_help_flag" full "        4.2 (older!): If multiple versions are used for the same package, it tags the older one"
	_help_print "$local_help_flag" full ""
	_help_print "$local_help_flag" full "Configuration:"
	_help_print "$local_help_flag" full "  PROJECT_ROOT: For setting 'work root folder' and process it recursively"
	_help_print "$local_help_flag" full "  LOG_DIR: Folder where logs will be stored"
	_help_print "$local_help_flag" full "  LOG_FILE: For setting log file"
	_help_print "$local_help_flag" full "  SILENT: Enables/Disables output to the terminal"
	_help_print "$local_help_flag" full "  Command used for install: $INSTALL_CMD"
	_help_print "$local_help_flag" full "  PRETTIFY: For enabling-disabling colors and icons in output"
	_help_print "$local_help_flag" full ""
}

# Early help detection
for local_help_arg in "$@"; do
	case "$local_help_arg" in
		-h|--help)
			print_help base
			exit 0
			;;
		--help=full)
			print_help full
			exit 0
			;;
	esac
done

################################### LOGGING ####################################
# Strip prettify if not TTY
[ ! -t 1 ] && PRETTIFY=false
[ "$PRETTIFY" = false ] && RED="" YELLOW="" NC="" OUTDATED_ICON="" INCONSISTENCY_ICON=""

timestamp() { [ "$ENABLE_TIMESTAMP" = true ] && date "+%Y-%m-%d %H:%M:%S"; }

log() {
	msg="$(printf "%s %s" "$(timestamp)" "$1")"
	[ "$SILENT" = false ] && printf "%s\n" "$msg"
	if [ "$LOG_ENABLED" = true ]; then
		# Create folder if not exists
		mkdir -p "$LOG_DIR"
		# Strip color codes (safe) and icons
		printf "%s\n" "$(printf "%s" "$msg" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | sed 's/⚠️//g; s/🟥//g')" >> "$LOG_FILE"
	fi
}

################################### CORE OPS ###################################
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

# === ARG PARSING ===
for arg in "$@"; do
	case "$arg" in
		-i|--install) ACTION="install" ;;
		-u|--uninstall) ACTION="uninstall" ;;
		-c|--check) ACTION="check" ;;
		-s|--silent) SILENT=true ;;
		--log) LOG_ENABLED=true ;;
		--dry-run) DRY_RUN=true ;;
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
# Print execution start (logfile separation for easier location)
# Create folder if not exists
mkdir -p "$LOG_DIR"
printf "%s\n" "################ EXECUTION STARTED ###############" >> "$LOG_FILE"

case "$ACTION" in
	check) check_versions ;;
	install|uninstall)
		handle_root
		find_services
		log "${GREEN}✅ Done: $ACTION completed.${NC}"
		;;
esac
