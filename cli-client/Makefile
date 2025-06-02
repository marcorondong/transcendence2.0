VENV_DIR := venv
PYTHON := $(VENV_DIR)/bin/python
PIP := $(VENV_DIR)/bin/pip
PYCACHE_DIR := __pycache__
LOG_FILE := cli-client.log
ALL_PYCACHE_DIRS = $(PYCACHE_DIR) menu/$(PYCACHE_DIR) utils/$(PYCACHE_DIR) window/$(PYCACHE_DIR)

.PHONY: all venv install run clean

all: run

venv:
	virtualenv $(VENV_DIR)

install: venv
	$(PIP) install -r requirements.txt

run: install
	$(PYTHON) mainMenu.py

clean:
	rm -rf $(VENV_DIR)
	rm -rf $(ALL_PYCACHE_DIRS)
	rm -f $(LOG_FILE)
