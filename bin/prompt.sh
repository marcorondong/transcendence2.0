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
			--question=*)
				local_question=${local_prompt_arg#*=}
				;;
			--opt=*)
				local_prompt_val=${local_prompt_arg#*=}
				# if [ -n "$local_options" ]; then
				# 	local_options="$local_options|||$local_prompt_val"
				# else
				# 	local_options="$local_prompt_val"
				# fi
				local_options="${local_options}${local_options:+
}$local_prompt_val"
				;;
			--default=*)
				local_default=${local_prompt_arg#*=}
				;;
			--return=*)
				local_return_type=${local_prompt_arg#*=}
				case "$local_return_type" in
					index|value) ;; # ok
					*)
						printf "Invalid --return type: %s. Use 'index' or 'value'.\n" "$local_return_type" >&2
						return 1
						;;
				esac
				;;
			*)
				printf "Unknown argument: %s\n" "$local_prompt_arg" >&2
				return 1
				;;
		esac
	done

	# Split options into positional parameters
	# IFS='|||' set -- $local_options
	IFS='
' set -- $local_options
	local_total_opts=$#
	local_i=""
	local_input=""
	local_trimmed=""
	local_selected=""

	# Validate default index
	case "$local_default" in
		''|*[!0-9]*) local_default=1 ;;  # fallback
	esac
	[ "$local_default" -gt "$local_total_opts" ] && local_default=1

	# Display question and options
	printf "%s (Default: \"%s\". Press ENTER to select it)\n" \
		"$local_question" "$local_default"

	local_i=1
	printf '%s\n' "$local_options" | while IFS= read -r local_opt_line; do
		printf "%s) %s\n" "$local_i" "$local_opt_line"
		local_i=$((local_i + 1))
	done

	# Prompt loop
	while :; do
		printf "Your selection: "
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
					local_selected=$local_trimmed
					if [ "$local_return_type" = "value" ]; then
					local_result=$(printf '%s\n' "$local_options" | get_nth_line "$local_selected")
						printf "%s\n" "$local_result"
						return 0
					else
						printf "%s\n" "$local_selected"
						return 0
					fi
				fi
				;;
		esac

		# Invalid input
		printf "Wrong selection: \"%s\". Please write a number between 1 and %s.\n" \
			"$local_trimmed" "$local_total_opts"
	done
}

# Test returning index (default behavior)
prompt_for \
	--question="Select your favorite fruit" \
	--opt="Apple" \
	--opt="Banana" \
	--opt="Cherry" \
	--default=2

# Test returning value (option string)
prompt_for \
	--question="Select your favorite language" \
	--opt="C" \
	--opt="Python" \
	--opt="Rust" \
	--default=1 \
	--return=value
