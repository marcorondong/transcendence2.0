#!/bin/sh

# ---------------------#
# node_package_mgr.sh  #
# ---------------------#

set -u

# === CONFIG ===
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"  # Adjust if you move this script
SILENT=false
ACTION=""
INSTALL_CMD="npm install"

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

safe_exit_error() {
	safe_cleanup
	exit 1
}

safe_exit_success() {
	safe_cleanup
	exit 0
}

# Ignore broken pipe errors
trap '' PIPE
# Safe exit and set correct error code
trap 'safe_exit_error' INT TERM HUP
trap 'safe_exit_success' EXIT

############################### LOGGING FUNCTION ###############################
timestamp() { date "+%Y-%m-%d %H:%M:%S"; }

log() {
	[ "$SILENT" = true ] && return
	printf "$(timestamp) $1"
}

############################### HELPER FUNCTIONS ###############################
# === USAGE ===
usage() {
	printf "%s\n" "Usage: $0 [--install | --uninstall] [--silent]"
	exit 1
}

# === INSTALL ===
install() {
	local_service_dir="$1"

	log "Installing in $local_service_dir"
	# (cd "$local_service_dir" && npm install) || log "❌ Failed in $local_service_dir"
	(cd "$local_service_dir" && $INSTALL_CMD) || log "❌ Failed in $local_service_dir"
}

# === UNINSTALL ===
uninstall() {
	local_service_dir="$1"

	log "Uninstalling in $local_service_dir"
	rm -rf "${local_service_dir}/node_modules" "${local_service_dir}/package-lock.json" || log "❌ Failed in $local_service_dir"
}

# === FIND AND PROCESS SERVICES ===
find_services() {
	find "$PROJECT_ROOT" -type f -name "package.json" ! -path "${PROJECT_ROOT}/package.json" | while read -r pkgfile; do
		service_dir=$(dirname "$pkgfile")
		case "$ACTION" in
		install)
			install "$service_dir" ;;
		uninstall)
			uninstall "$service_dir" ;;
		esac
	done
}

# === ROOT PACKAGE HANDLING ===
handle_root() {
if [ -f "${PROJECT_ROOT}/package.json" ]; then
	case "$ACTION" in
	install)
		log "Installing root dependencies"
		install "$PROJECT_ROOT"
		;;
	uninstall)
		log "Uninstalling root node_modules"
		uninstall "$PROJECT_ROOT"
		;;
	esac
else
	root_folder="$(basename "$PROJECT_ROOT")"
	printf "%s\n" "No package.json found in root ${root_folder}"
fi
}

################################## MAIN LOGIC ##################################
# === PARSE ARGS ===
for local_main_arg in "$@"; do
	case "$local_main_arg" in
		-i|--install) ACTION="install" ;;
		-u|--uninstall) ACTION="uninstall" ;;
		-s|--silent) SILENT=true ;;
		-h|--help) usage ;;
		*) printf "%s\n" "Unknown option: $1"; usage ;;
	esac
done

# === PROMPT IF NO FLAG ===
if [ -z "$ACTION" ]; then
	printf "%s\n" "What do you want to do?"
	printf "%s\n"  "1) Install all node packages"
	printf "%s\n"  "2) Uninstall all node packages"
	printf "%s\n"  "Enter choice [1-2]: "
	CURRENT_IFS=$IFS
	IFS= read -r choice < /dev/tty
	IFS=$CURRENT_IFS
	case "$choice" in
		1) ACTION="install" ;;
		2) ACTION="uninstall" ;;
		*) printf "%s\n" "Invalid choice"; exit 1 ;;
	esac
fi

# === MAIN ===
handle_root
find_services
log "✅ Done: $ACTION completed."
