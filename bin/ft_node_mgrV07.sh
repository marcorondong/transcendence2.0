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
TRASH_DIR="/tmp/${USER}/transcendence"
LOCK_TRASH_DIR="${TRASH_DIR}/package_lock"
PKG_TRASH_DIR="${TRASH_DIR}/package"
LOG_FILE="${TRASH_DIR}/node_package_mgr.log"

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

############################### PROMPT FUNCTION ################################
# Helper function for the HEREDOC to not break indentation
get_nth_line() {
	# $1 = line number (1-based)
	# Reads from stdin
	awk -v sel="$1" '
		BEGIN { i = 1 }
		{
			if (i == sel) {
				print $0
				exit
			}
			i++
		}
	'
}

# ========================
# Prompt user to select an option
# Usage:
# prompt_for \
#   --question="Select an option" \
#   --opt="Option 1" \
#   --opt="Option 2" \
#   --opt="Option 3" \
#   --default=1
#   --return=value
# ========================
prompt_for() {
	# Initialize variables
	local_question=""
	local_options=""
	local_default=""
	local_return_type="index"
	local_prompt_arg=""
	local_val=""

	# Parse arguments
	for local_prompt_arg in "$@"; do
		case "$local_prompt_arg" in
			--question=*) local_question=${local_prompt_arg#*=} ;;
			--opt=*) local_prompt_val=${local_prompt_arg#*=}
				local_options="${local_options}${local_options:+
}${local_prompt_val}" ;;
			--default=*) local_default=${local_prompt_arg#*=} ;;
			--return=*) local_return_type=${local_prompt_arg#*=}
				case "$local_return_type" in index|value) ;; *) printf "Invalid --return type: %s\n" "$local_return_type" >&2; return 1 ;; esac ;;
			*) printf "Unknown argument: %s\n" "$local_prompt_arg" >&2; return 1 ;;
		esac
	done

	# Split options into positional parameters
	local_total_opts=""
	local_i=""
	local_input=""
	local_trimmed=""
	local_selected=""
	local_total_opts=$(printf '%s\n' "$local_options" | wc -l | tr -d ' ')

	# Validate default index
	case "$local_default" in ''|*[!0-9]*) local_default=1 ;; esac
	[ "$local_default" -gt "$local_total_opts" ] 2>/dev/null && local_default=1

	# Display question and options
	printf "%s (Default: \"%s\". Press ENTER to select it)\n" "$local_question" "$local_default" > /dev/tty
	local_i=1
	printf '%s\n' "$local_options" | while IFS= read -r local_opt_line; do
		printf "%s) %s\n" "$local_i" "$local_opt_line" > /dev/tty
		local_i=$((local_i + 1))
	done

	# Prompt loop
	while :; do
		printf "Your selection: " > /dev/tty
		if ! IFS= read -r local_input < /dev/tty; then
			local_input=""
		fi

		# Trim input
		local_trimmed="${local_input#"${local_input%%[![:space:]]*}"}"
		local_trimmed="${local_trimmed%"${local_trimmed##*[![:space:]]}"}"
		[ -z "$local_trimmed" ] && local_trimmed=$local_default

		# Check numeric input in range
		case "$local_trimmed" in
			*[!0-9]*|'') ;;
			*)
				if [ "$local_trimmed" -ge 1 ] && [ "$local_trimmed" -le "$local_total_opts" ]; then
					if [ "$local_return_type" = "value" ]; then
						result=$(get_nth_line "$local_trimmed" <<EOF
$local_options
EOF
)
						printf "%s\n" "$result"
						return 0
					else
						printf "%s\n" "$local_trimmed"
						return 0
					fi
				fi ;;
		esac

		# Invalid input
		printf "Wrong selection: \"%s\". Please write a number between 1 and %s.\n" \
			"$local_trimmed" "$local_total_opts" > /dev/tty
	done
}

############################### HELPER FUNCTIONS ###############################
relative_to_root() {
	printf "%s" "${1#$PROJECT_ROOT/}"
}

sanitize_path() {
	echo "${1}" | sed 's/\//_/g'
}

timestamp() { [ "$ENABLE_TIMESTAMP" = true ] && date "+%Y-%m-%d %H:%M:%S"; }

log() {
	local_log_msg="$(printf "%s %s" "$(timestamp)" "${1}")"
	[ "$SILENT" = false ] && printf "%s\n" "${local_log_msg}"
	if [ "$LOG_ENABLED" = true ]; then
		# Create folder if not exists
		mkdir -p "${TRASH_DIR}"
		printf "%s\n" "$(printf "%s" "${local_log_msg}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g; s/⚠️//g; s/🟥//g')" >> "$LOG_FILE"
		# TODO: Why this changed (Ver04)?
		# printf "%s\n" "$(printf "%s" "${local_log_msg}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | sed 's/⚠️//g; s/🟥//g')" >> "$LOG_FILE" 
		# printf "%s\n" "$(printf "%s" "$local_log_msg" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | sed 's/[\xf7\xe1]//g')" >> "$LOG_FILE"
	fi
}

backup_file() {
	local_bkup_file="${1}"
	local_bkup_base="$(basename "$local_bkup_file")"
	local_bkup_rel_path="${local_bkup_file#$PROJECT_ROOT/}" # TODO: See if I should escape this too
	is_lock_file=false
	case "$local_bkup_base" in
		package-lock.json) dest_dir="${LOCK_TRASH_DIR}"; is_lock_file=true ;;
		package.json) dest_dir="${PKG_TRASH_DIR}" ;;
		*) dest_dir="${PKG_TRASH_DIR}" ;; #TODO: Should I do this? Or create another folder?
	esac

	case "$DEFAULT_KEEP_MODE" in
		overwrite) local_bkup_dest="${dest_dir}/${local_bkup_base}" ;;
		add-path) local_bkup_dest="${dest_dir}/$(sanitize_path "${local_bkup_rel_path}")" ;;
		add-path-timestamp) local_bkup_dest="${dest_dir}/$(sanitize_path "${local_bkup_rel_path}")_$(date +%Y%m%d%H%M%S)" ;;
	esac

	[ "$DRY_RUN" = true ] && log "🟡  Would back up: \"${local_bkup_file#$PROJECT_ROOT}\" to \"${local_bkup_dest}\"" && return

	# Create folder if not exists
	mkdir -p "${dest_dir}"
	if [ "$is_lock_file" = true ]; then
		mv "${local_bkup_file}" "${local_bkup_dest}"
	else
		cp "${local_bkup_file}" "${local_bkup_dest}"
	fi
}

################################### CORE OPS ###################################
install() {
	local_inst_dir="$1"
	[ -f "${local_inst_dir}/package-lock.json" ] && INSTALL_CMD="$INSTALL_CMD_2" || INSTALL_CMD="$INSTALL_CMD_1"
	local_inst_rel_path="${local_inst_dir#$PROJECT_ROOT/}" # TODO: See if I should escape this too
	[ "${local_inst_rel_path}" = "${local_inst_dir}" ] && local_inst_rel_path="."

	local_inst_answer=$(prompt_for \
		--question="Sanitize package.json before install in \"${local_inst_rel_path}\"?" \
		--opt="Yes" \
		--opt="No" \
		--opt="Skip this install" \
		--default=1 \
		--return=value)

	case "$local_inst_answer" in
		Yes) sanitize_versions "${local_inst_dir}" -only-this ;;
		Skip*) log "⏭️ Skipping install in \"$local_inst_rel_path\""; return 0 ;;
	esac

	log "${CYAN}Installing in \"${local_inst_rel_path}\"${NC}"
	if [ "$DRY_RUN" = true ]; then
		log "🟡  Would run this: cd \"${local_inst_rel_path}\" && \"${INSTALL_CMD}\""
	else
		(cd "${local_inst_dir}" && $INSTALL_CMD) || log "${RED}❌ Failed in \"${local_inst_rel_path}\"${NC}"
	fi
}

uninstall() {
	local_uninst_dir="$1"
	local_uninst_rel_path="${local_uninst_dir#$PROJECT_ROOT/}" # TODO: See if I should escape this too
	[ "${local_uninst_rel_path}" = "${local_uninst_dir}" ] && local_uninst_rel_path="."

	local_uninst_answer=$(prompt_for \
		--question="Uninstall mode for \"${local_uninst_rel_path}\"?" \
		--opt="Soft: only remove node_modules" \
		--opt="Hard: remove node_modules and package-lock.json" \
		--opt="Skip this uninstall" \
		--default=1 \
		--return=value)

	case "$local_uninst_answer" in
		Skip*) log "⏭️ Skipping uninstall in \"$local_uninst_rel_path\""; return 0 ;;
		Soft*) local_uninst_mode="soft" ;;
		Hard*) local_uninst_mode="hard" ;;
	esac

	log "${CYAN}Uninstalling in \"${local_uninst_rel_path}\"${NC}"
	if [ "$DRY_RUN" = true ]; then
		log "🟡  Would run this: rm -rf \"${local_uninst_rel_path}/node_modules\""
		[ "$local_uninst_mode" = "hard" ] && log "🟡  Would also move package-lock.json to trash"
	else
		rm -rf "${local_uninst_dir}/node_modules"
		if [ "$local_uninst_mode" = "hard" ] && [ -f "${local_uninst_dir}/package-lock.json" ]; then
			backup_file "${local_uninst_dir}/package-lock.json"
		fi
	fi
}

sanitize_versions() {
	local_sanitize_dir="${1:-$TARGET_DIR}"
	local_sanitize_scope="${2:-}"

	local_sanitize_answer=$(prompt_for \
		--question="What do you want to do with version symbols?" \
		--opt="Replace ^ with ~ or vice versa" \
		--opt="Remove ^ or ~" \
		--opt="Lock all versions (remove ^/~)" \
		--opt="Add ^ or ~ (only to versions without symbol)" \
		--opt="Abort" \
		--default=3 \
		--return=value)

	case "$local_sanitize_answer" in
		Replace*) local_sanitize_answer="replace" ;;
		Remove*) local_sanitize_answer="remove" ;;
		Lock*)   local_sanitize_answer="lock" ;;
		Add*)    local_sanitize_answer="add" ;;
		Abort*)  log "❌ Aborted."; return 0 ;;
	esac

	local_sanitize_symbol=""
	local_sanitize_replacement=""

	case "$local_sanitize_answer" in
		lock) local_sanitize_symbol='[\^~]'; local_sanitize_replacement='' ;;
		replace|remove)
			while :; do
				printf "Target symbol to modify (^ or ~): "
				IFS= read -r local_sanitize_symbol < /dev/tty
				case "$local_sanitize_symbol" in
					'^'|'~') break ;;
					*) printf "Invalid symbol: %s\n" "$local_sanitize_symbol" ;;
				esac
			done
			[ "$local_sanitize_answer" = replace ] && local_sanitize_replacement=$( [ "$local_sanitize_symbol" = "^" ] && echo "~" || echo "^" ) || local_sanitize_replacement=''
			;;
		add)
			while :; do
				printf "Which symbol to add to unsymbolized versions (^ or ~): "
				IFS= read -r local_sanitize_symbol < /dev/tty
				case "$local_sanitize_symbol" in
					'^'|'~') break ;;
					*) printf "Invalid symbol: %s\n" "$local_sanitize_symbol" ;;
				esac
			done
			;;
	esac

	# Helper function
	sanitize_file() {
		local_sanitize_file="$1"
		backup_file "$local_sanitize_file"
		if [ "$DRY_RUN" = true ]; then
			log "🟡  Would sanitize ${local_sanitize_file#$PROJECT_ROOT}"
			return
		fi
		if [ "$local_sanitize_answer" = add ]; then
			sed -i -E "s/\"([^\"]+)\": \"([0-9])/\"\1\": \"$local_sanitize_symbol\2/g" "$local_sanitize_file"
		else
			sed -i "s/\"${local_sanitize_symbol}/\"${local_sanitize_replacement}/g" "$local_sanitize_file"
		fi
	}

	if [ "${local_sanitize_scope}" = "-only-this" ]; then
		local_sanitize_pkgfile="${local_sanitize_dir}/package.json"
		[ -f "${local_sanitize_pkgfile}" ] && sanitize_file "${local_sanitize_pkgfile}"
	else
		find "${local_sanitize_dir}" -path '*/node_modules/*' -prune -o -type f -name "package.json" -print | sort |
		while IFS= read -r local_sanitize_pkgfile; do
			sanitize_file "$local_sanitize_pkgfile"
		done
	fi
}

# TODO: Handle symlinks
find_services() {
	log "${CYAN}🔧 Microservice Dependencies${NC}"
	find "${TARGET_DIR}" -path '*/node_modules/*' -prune -o -type f -name "package.json" ! -path "${PROJECT_ROOT}/package.json" -print | sort |
	while IFS= read -r pkgfile; do
		local_find_service_dir="$(dirname "${pkgfile}")"
		case "$ACTION" in
			install) install "${local_find_service_dir}" ;;
			uninstall) uninstall "${local_find_service_dir}" ;;
		esac
	done
}

handle_root() {
	if [ -f "${TARGET_DIR}/package.json" ]; then
		log "${CYAN}🔧 Root Dependencies${NC}"
		case "$ACTION" in
			install) install "${TARGET_DIR}" ;;
			uninstall) uninstall "${TARGET_DIR}" ;;
		esac
	else
		log "${YELLOW}No package.json found in project root${NC}"
	fi
}

check_versions() {
	log "${BLUE}Checking package versions...${NC}"
	tmpfile="$(mktemp)"
	find "${TARGET_DIR}" -path '*/node_modules/*' -prune -o -type f -name "package.json" -print | sort |
	while IFS= read -r json_path; do
		service_path="${json_path#$PROJECT_ROOT/}" # TODO: See if I should escape this too
		service_dir="$(dirname "${service_path}")"
		for section in dependencies devDependencies; do
			jq -r "try .${section} // empty | to_entries[] | \"\(.key) \(.value) ${service_dir} ${section}\"" "${json_path}" >> "${tmpfile}"
		done
	done

	for section in dependencies devDependencies; do
		log ""
		log "${PURPLE}### ${section} ###${NC}"
		cut -d' ' -f1,4 "${tmpfile}" | grep " ${section}\$" | cut -d' ' -f1 | sort -u |
		while IFS= read -r package; do
			grep "^${package} " "${tmpfile}" | grep " ${section}\$" > "${tmpfile}.pkg"
			all_versions="$(cut -d' ' -f2 "${tmpfile}.pkg" | sort -u)"
			newest_ver="$(echo "${all_versions}" | sort -Vr | head -n1)"
			dual_section=$(grep "^${package} " "${tmpfile}" | cut -d' ' -f4 | sort -u | wc -l)

			log "${GREEN}├── ${package}${NC}"
			while IFS=' ' read -r pkg ver svc sec; do
				warning=""
				[ "${dual_section}" -gt 1 ] && warning="${YELLOW}${INCONSISTENCY_ICON}${NC} (mismatch!)"
				[ "${ver}" != "${newest_ver}" ] && warning="$warning ${RED}${OUTDATED_ICON}${NC} (older!)"
				log "│   ├── ${svc} → ${ver} ${warning}"
			done < "${tmpfile}.pkg"
			log ""
			rm -f "${tmpfile}.pkg"
		done
	done
	rm -f "${tmpfile}"
	log "${BLUE}✅ Version check complete.${NC}"
}

# =====  ARG PARSING ===== #
for local_main_arg in "$@"; do
	case "${local_main_arg}" in
		-i|--install) ACTION="install" ;;
		-u|--uninstall) ACTION="uninstall" ;;
		-c|--check) ACTION="check" ;;
		-s|--sanitize) ACTION="sanitize" ;;
		-t|--target=*) TARGET_DIR="${local_main_arg#*=}" ;;
		--silent) SILENT=true ;;
		--log) LOG_ENABLED=true ;;
		--dry-run) DRY_RUN=true ;;
		*) printf "Unknown option: %s\n" "${local_main_arg}"; exit 1 ;;
	esac
done

choose_action() {
	local_choose_action=$(prompt_for \
		--question="What do you want to do?" \
		--opt="Install all node packages" \
		--opt="Uninstall all node packages" \
		--opt="Check for version mismatches" \
		--opt="Sanitize package.json files" \
		--opt="Targeted mode" \
		--default=1 \
		--return=value)

	case "$local_choose_action" in
		Install*) ACTION="install" ;;
		Uninstall*) ACTION="uninstall" ;;
		Check*) ACTION="check" ;;
		Sanitize*) ACTION="sanitize" ;;
		Target*) ACTION="targeted" ;;
	esac
}

choose_target() {
	printf "Enter target directory (absolute or relative to project root): "
	IFS= read -r raw_target < /dev/tty
	if [ -d "$raw_target" ]; then
		TARGET_DIR="$(resolve_path "$raw_target")"
	elif [ -d "$PROJECT_ROOT/$raw_target" ]; then
		TARGET_DIR="$(resolve_path "$PROJECT_ROOT/$raw_target")"
	else
		printf "Invalid target directory: %s\n" "$raw_target"
		exit 1
	fi

	local_sub_action=$(prompt_for \
		--question="What do you want to do in target?" \
		--opt="Install all node packages" \
		--opt="Uninstall all node packages" \
		--opt="Check for version mismatches" \
		--opt="Sanitize package.json files" \
		--default=1 \
		--return=value)

	case "$local_sub_action" in
		Install*) ACTION="install" ;;
		Uninstall*) ACTION="uninstall" ;;
		Check*) ACTION="check" ;;
		Sanitize*) ACTION="sanitize" ;;
	esac
}

##################################### MAIN #####################################
printf "%s\n" "### TESTING ###" >> "$LOG_FILE"
# ===== Launch if no --flags provided ===== #
[ -z "$ACTION" ] && choose_action
[ "$ACTION" = "targeted" ] && choose_target

mkdir -p "$TRASH_DIR"
printf "%s\n" "######################## EXECUTION STARTED ########################" >> "$LOG_FILE"

case "$ACTION" in
	check) check_versions ;;
	sanitize) sanitize_versions ;;
	install|uninstall)
		handle_root
		find_services
		log "${GREEN}✅ Done: $ACTION completed.${NC}"
		;;
esac
