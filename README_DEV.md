# 📚 Development Formatting Guide

This project uses a strict and consistent code formatting setup to ensure readability and avoid unnecessary diffs across different environments and editors.

Please follow the guidelines below and **do not modify these configurations unless agreed upon by the team**.

---

## 🔧 Editor Configuration

We use [EditorConfig](https://editorconfig.org/) to standardize basic formatting settings across IDEs and editors.

### Global Rules (`.editorconfig`)
- **Tabs** are used for indentation (except where specified).
- **LF** line endings (unix style).
- UTF-8 encoding.
- Final newline required.
- Max line length: **80 characters**.
- Trailing whitespace: **trimmed automatically**.

### File-specific overrides:
- `.yml` / `.yaml`: Use **2 spaces** for indentation (tabs are forbidden according to yaml documentation).
- `.md` (Markdown): No enforced indentation, trailing spaces preserved, no line length limit (to avoid Markdown editors/viewers issues).

---

## 💅 Prettier Formatter

Prettier ensures consistent formatting on save and CI.

### Base rules (`.prettierrc`)
- Tabs for indentation (`useTabs: true`, `tabWidth: 4`).
- Always use semicolons.
- All strings use double quotes.
- 80 character line wrap.
- Trailing commas everywhere possible.
- Consistent quoting for object keys.
- Attributes split per line.

### YAML Override
- YAML files are formatted with:
  - `useTabs: false`
  - `tabWidth: 2`

### Ignore Rules (`.prettierignore`)
- Markdown files (`*.md`) are **excluded from formatting**.

---

## 💻 VSCode Settings

The `.vscode/settings.json` file ensures your editor behaves consistently.

### Base settings:
- Indentation: **Tabs** (`tabSize: 4`, `insertSpaces: false`).
- Auto-format on save enabled.
- Whitespace and bracket guides active.
- Prettier required and used as default formatter.
- Git auto-fetch enabled.
- Ruler to remember our dear max 80 columns wide restriction.

### YAML-specific override:
```json
"[yaml]": {
  "editor.insertSpaces": true,
  "editor.tabSize": 2
}
```

---

## ✅ Spell Checker
- The Code Spell Checker extension is configured via cspell.json.
- Uses custom dictionaries: custom-words.txt, forbidden-words.txt.
- Ignores build, dependency, and config paths (e.g., node_modules, .git, dist).
- Checks for duplicate/invalid words and gives suggestions.
- Treats camelCase, snake_case, and compound words strictly.

---


## 📝 Developer Checklist
Before pushing changes:
- No formatting issues on save.
- No spelling issues (cspell warnings).
- YAML files use spaces, not tabs.
- No diffs caused by inconsistent indentation.
- Markdown files are manually reviewed (they’re not auto-formatted).

---

## 🧩 Recommended Extensions
Make sure you have these installed (auto-recommended by the project):
- Prettier
- Code Spell Checker (English)

---

# Happy coding! 🎮