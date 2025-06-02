VENV_DIR := venv
PYTHON := $(VENV_DIR)/bin/python
PIP := $(VENV_DIR)/bin/pip
LOG_FILE := cli-client.log

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
	find . -name '__pycache__' -exec rm -rf {} +
	find . -name '*.pyc' -delete
	rm -f $(LOG_FILE)
