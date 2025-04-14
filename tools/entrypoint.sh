#!/bin/bash

# Parse arguments
for arg in "$@"; do
	case $arg in
		--debug)
			ARGS_DEBUG_MODE=true
			;;
		--trace)
			ARGS_TRACE_MODE=true
			;;
		--host=*)
			ARGS_HOST="${arg#*=}"
			;;
		--port=*)
			ARGS_PORT="${arg#*=}"
			;;
		--endpoint=*)
			ARGS_API_ENDPOINT="${arg#*=}"
			;;
		--logfile=*)
			ARGS_LOG_FILE="${arg#*=}"
			;;
		--error-logfile=*)
			ARGS_ERROR_LOG_FILE="${arg#*=}"
			;;
		--append-logs)
			ARGS_APPEND_MODE=true
			;;
		--check-vars=*)
			ARGS_CHECK_VARS="${arg#*=}"  # Env vars to check
			;;
		*)
			echo "Unknown argument: $arg"
			# exit 1
			;;
	esac
done

############################# VARIABLES DECLARATIONS ###########################
# Basic args validation: Assign defaults if empty (export them to be used in child processes)
export ARGS_DEBUG_MODE="${ARGS_DEBUG_MODE:-false}"
export ARGS_TRACE_MODE="${ARGS_TRACE_MODE:-false}"
export ARGS_HOST="${ARGS_HOST:-0.0.0.0}"
export ARGS_PORT="${ARGS_PORT:-8000}"
export ARGS_API_ENDPOINT="${ARGS_API_ENDPOINT:-api/v1/users}"
ARGS_LOG_FILE="${ARGS_LOG_FILE:-/dev/stdout}"
ARGS_ERROR_LOG_FILE="${ARGS_ERROR_LOG_FILE:-/dev/stderr}"
ARGS_APPEND_MODE="${ARGS_APPEND_MODE:-false}"
ARGS_CHECK_VARS="${ARGS_CHECK_VARS:-}"

# Define/export vars (so they can be used in child processes)
export RUN_GET_ENDPOINT="${ARGS_API_ENDPOINT}/list/?all=true"
export RUN_POST_ENDPOINT="${ARGS_API_ENDPOINT}/"
export RUN_MAX_RETRIES=15
export RUN_INTERVAL=5
LOG_DIR_LOCATION=$(dirname "$0")  # Logs will be created where the script is located
# LOG_DIR_LOCATION=$(pwd)  # Logs will be created where the script is executed
LOG_DIR_NAME="logs"
LOG_DIR="$LOG_DIR_LOCATION/$LOG_DIR_NAME"
ENABLE_TIMESTAMP=true

# Read values from secrets
# DB_NAME=$(cat /run/secrets/db_name)
# DB_USER=$(cat /run/secrets/db_user)

# Define color codes
BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
NC='\033[0m' # No color

############################# DETERMINE ENVIRONMENT ############################
# Enable tracing if ARGS_TRACE_MODE is true (place it before all to inspect all vars values)
if [ "$ARGS_TRACE_MODE" = true ]; then
	set -x
fi

# Check if running inside Docker container (This for LXC too: grep -sq 'docker\|lxc' /proc/1/cgroup)
if [ -f /.dockerenv ] || grep -q 'docker' /proc/1/cgroup; then
	IN_CONTAINER=true
else
	IN_CONTAINER=false
fi

# Function to print environment variables
print_env() {
	if [ "$#" -eq 0 ]; then
		printenv  # Print all env variables
	else
		for var in $@; do
			echo "$var=${!var}"  # Print only specified vars
		done
	fi
}

# Call function with extracted variables or print all if none specified
if [ -n "$ARGS_CHECK_VARS" ]; then
	print_env $ARGS_CHECK_VARS  # Print specified variables
else
	# print_env  # Print all env variables
	if [ "$ARGS_TRACE_MODE" = true ]; then
		print_env  # Print all env variables
	fi
fi

############################## LOGGING REDIRECTION #############################
# Determine if either log file already exists
LOG_FILE_EXISTS=false
ERROR_LOG_FILE_EXISTS=false

if [ "$ARGS_LOG_FILE" != "/dev/stdout" ] && [ -f "$ARGS_LOG_FILE" ]; then
	LOG_FILE_EXISTS=true
	LOG_DIR=$(dirname "$ARGS_LOG_FILE")  # Reset LOG_DIR value set in top vas
fi

if [ "$ARGS_ERROR_LOG_FILE" != "/dev/stderr" ] && [ -f "$ARGS_ERROR_LOG_FILE" ]; then
	ERROR_LOG_FILE_EXISTS=true
	LOG_DIR=$(dirname "$ARGS_ERROR_LOG_FILE")  # Reset LOG_DIR value set in top vars
fi

# If neither file exists AND log files are not default, create "logs" folder
if [ "$LOG_FILE_EXISTS" = false ] && [ "$ERROR_LOG_FILE_EXISTS" = false ] &&
[ "$ARGS_LOG_FILE" != "/dev/stdout" ] && [ "$ARGS_ERROR_LOG_FILE" != "/dev/stderr" ]; then
	mkdir -p "$LOG_DIR"
fi

# Function to determine log file locations
setup_log_files() {
	local file_path="$1"
	local default_dev="$2"
	local script_name
	local var_file

	script_name=$(basename "$0")

	if [ "$file_path" != "$default_dev" ]; then
		if [ -f "$file_path" ]; then
			var_file="$file_path"  # File exists, use it directly
		else
			var_file="$LOG_DIR/${script_name}_$(basename "$file_path")"
			touch "$var_file"
		fi
	else
		var_file="$default_dev"
	fi

	echo "$var_file"
}

# Determine log file paths
VAR_LOG_FILE=$(setup_log_files "$ARGS_LOG_FILE" "/dev/stdout")
VAR_ERROR_LOG_FILE=$(setup_log_files "$ARGS_ERROR_LOG_FILE" "/dev/stderr")

# Apply script-wide redirection only to non-default outputs (stdout: '>' and stderr '2>')
if [ "$VAR_LOG_FILE" != "/dev/stdout" ]; then
	if [ "$ARGS_APPEND_MODE" = true ]; then
		exec >> "$VAR_LOG_FILE"  # Append mode
	else
		exec > "$VAR_LOG_FILE"  # Overwrite mode
	fi
fi
if [ "$VAR_ERROR_LOG_FILE" != "/dev/stderr" ]; then
	if [ "$ARGS_APPEND_MODE" = true ]; then
		exec 2>> "$VAR_ERROR_LOG_FILE"  # Append mode
	else
		exec 2> "$VAR_ERROR_LOG_FILE"  # Overwrite mode
	fi
fi

############################### LOGGING FUNCTION ###############################
# Generalized log function
log_print() {
	# Local vars for log_print function
	local enable_timestamp="$ENABLE_TIMESTAMP"
	local log_type="$1"  # DEBUG / ERROR
	local color="$2"      # Color for output
	local nc="$NC"
	local message="$3"    # Message content
	local newline=true
	local separator=true
	local stderr_output=false
	local include_title=true  # Default: include [DEBUG] / [ERROR]

	# Disable colors if output is not a terminal
	if [ ! -t 1 ]; then  
		color=""; nc=""
	fi

	shift 3  # Move past first 3 args (log_type, color, message)
	while [ $# -gt 0 ]; do
		case "$1" in
			-n|--no-newline) newline=false ;;
			-s|--no-separator) separator=false ;;
			-e|--stderr) stderr_output=true ;;  # Redirect errors to stderr
			-t|--no-title) include_title=false ;;  # Remove [DEBUG] or [ERROR]
		esac
		shift
	done

	# Print separator if enabled
	if [ "$separator" = true ]; then
		echo -e "${color}==================================================${nc}"
	fi
	# Construct message
	local output=""
	if [ "$include_title" = true ]; then
		if [ "$enable_timestamp" = true ]; then
			output="$(date '+%Y-%m-%d %H:%M:%S') "  # Add timestamp
		fi
		output+="[${log_type}] "
	fi
	output+="$message"
	# Print message
	if [ "$stderr_output" = true ]; then
		echo -ne "${color}$output${nc}" >&2  # Redirect to stderr
	else
		echo -ne "${color}$output${nc}"
	fi
	# Print newline if not disabled
	if [ "$newline" = true ]; then
		echo ""
	fi
}

# Debug print wrapper (only prints if ARGS_DEBUG_MODE=true)
debug_print() {
	if [ "$ARGS_DEBUG_MODE" = true ]; then
		log_print "DEBUG" "$PURPLE" "$@"
	fi
}

# Error print wrapper (always prints, sends to stderr)
error_print() {
	log_print "ERROR" "$RED" "$@" --stderr
}

############################ SCRIPT'S PURPOSE LOGIC ############################
# Install additional programs (Currently done in Dockerfile)
# if [ "$ARGS_DEBUG_MODE" = true ]; then
# 	apt-get update && apt-get upgrade -y && \
# 	apt-get install -y nano curl jq netcat-openbsd
# fi

# MR: IMPORTANT!!! Since it's a volume, DONT overwrite settings.py because original will be overwritten (Now done in settings.py directly)
## Applying custom settings.py
# debug_print "Applying custom settings.py..."
# mv /docker/config/settings.py /volume/pong/users/
if [ "${DJANGO_USE_POSTGRES,,}" = "true" ]; then
	debug_print "Using PostgreSQL..."
else
	debug_print "DJANGO_USE_POSTGRES=false or not set. Using SQLite..."
fi

# Migrate database and run server
cd /volume/
debug_print "Creating Migrations..."
python manage.py makemigrations
debug_print "Starting Migrations..."
python manage.py migrate

# Fill database
if [ "$ARGS_DEBUG_MODE" = true ]; then
	# Fork: Create a child process
	(
	ARGS_HOST="localhost"  # To issue requests to itself
	# Child Process: Wait for Django to be ready before running the script (adjust the timeout as needed)
	# Adjust RUN_MAX_RETRIES based on expected startup time
	counter=0
	delay=1  # Start with 1-second delay
	while ! curl -sf "http://$ARGS_HOST:$ARGS_PORT/$RUN_GET_ENDPOINT" > /dev/null; do
		# Print every $RUN_INTERVAL seconds
		if (( counter % $RUN_INTERVAL == 0 )); then
			debug_print "Waiting for Django server to start... (Attempt: $counter, Next retry in $delay sec)"
		fi
		counter=$((counter + 1))
		if (( counter >= $RUN_MAX_RETRIES )); then
			curl -sSf "http://$ARGS_HOST:$ARGS_PORT/$RUN_GET_ENDPOINT" > /dev/null
			error_print "Django server did not start after $RUN_MAX_RETRIES attempts. Exiting..."
			exit 1
		fi
		# sleep 1
		sleep $delay
		if (( counter < RUN_MAX_RETRIES )); then
			delay=$((delay * 2))  # Exponential increase
			# Limit max delay at 10 sec
			if (( delay > 10 )); then
				delay=10
			fi
		fi
	done

	debug_print "Django server is up! Checking database..."
	if [ "$(curl -sSf "http://$ARGS_HOST:$ARGS_PORT/$RUN_GET_ENDPOINT" | jq '. | length')" -ne 0 ]; then
		debug_print "Database is NOT empty. Skipping fill_db.py." -s
	else
		debug_print "Database is empty. Running fill_db.py..." -s
		chmod +x /docker/config/fill_db.py
		python /docker/config/fill_db.py --mode auto --count 25 --host="$ARGS_HOST" --port="$ARGS_PORT" --endpoint="$RUN_POST_ENDPOINT"
		debug_print "Database filled. " -s
	fi

	# Create superuser from environment variables (see docker-compose.yml)
	debug_print "Creating Django superuser"
	python manage.py createsuperuser --noinput || true

	debug_print "Exiting child process..."
	) &  # Run in the background as a separate process
fi

debug_print "Starting Server..."
exec python manage.py runserver $ARGS_HOST:$ARGS_PORT
