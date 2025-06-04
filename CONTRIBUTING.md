# Contributing to ft_transcendence20

Hi team! 🙋‍♂️
This will be our 📖 **guide** to contribute to the project. Here you can find the agreements we made.
BTW, thanks for contribute. 🙏👍

---

## Table Of Contents

<details>
<summary>Click to display Table Of Contents info</summary>

- [Contributing to ft\_transcendence20](#contributing-to-ft_transcendence20)
  - [Table Of Contents](#table-of-contents)
  - [TLDR](#tldr)
  - [Links to important resources](#links-to-important-resources)
    - [Docs](#docs)
    - [Bugs](#bugs)
    - [Comms](#comms)
    - [Tools](#tools)
      - [Debugging tools](#debugging-tools)
      - [Code sharing tools](#code-sharing-tools)
      - [File sharing tools](#file-sharing-tools)
      - [Drawing tools](#drawing-tools)
      - [Research tools](#research-tools)
      - [Note taking tools](#note-taking-tools)
      - [Miscellaneous tools](#miscellaneous-tools)
  - [Environment details](#environment-details)
  - [Testing](#testing)
  - [How to](#how-to)
    - [How to submit changes](#how-to-submit-changes)
      - [Branch naming](#branch-naming)
        - [Name pattern](#name-pattern)
      - [Committing](#committing)
        - [Atomic commits](#atomic-commits)
        - [Commit title](#commit-title)
        - [Commit body](#commit-body)
      - [Include notes and instructions for your contribution](#include-notes-and-instructions-for-your-contribution)
        - [In Pull Request](#in-pull-request)
        - [In the codebase](#in-the-codebase)
      - [Pull Request protocol](#pull-request-protocol)
        - [Creating a Pull Request](#creating-a-pull-request)
        - [Make PR reviews before start to work protocol](#make-pr-reviews-before-start-to-work-protocol)
        - [The PR owner merges it](#the-pr-owner-merges-it)
        - [More Long Living Branches More Merge Conflicts](#more-long-living-branches-more-merge-conflicts)
        - [The Reviewability of a Change Decreases With Size](#the-reviewability-of-a-change-decreases-with-size)
    - [How to report a bug](#how-to-report-a-bug)
    - [How to request a feature](#how-to-request-a-feature)
  - [Style Guide and Coding conventions](#style-guide-and-coding-conventions)
    - [Folders and files](#folders-and-files)
      - [Organization of folders and files](#organization-of-folders-and-files)
        - [Root of the repo](#root-of-the-repo)
        - [Services folders](#services-folders)
          - [src folder](#src-folder)
          - [docker folder](#docker-folder)
          - [Service root folder](#service-root-folder)
      - [Naming of folders and files](#naming-of-folders-and-files)
    - [Functions and variables](#functions-and-variables)
      - [Organization of functions and variables](#organization-of-functions-and-variables)
      - [Naming of functions and variables](#naming-of-functions-and-variables)
    - [Code formatting](#code-formatting)
  - [Templates](#templates)
    - [Reporting](#reporting)
      - [Issue report](#issue-report)
      - [Bug report](#bug-report)
      - [Feature request](#feature-request)
    - [Contributing](#contributing)
      - [Commit](#commit)
        - [Commit title template](#commit-title-template)
        - [Commit body template](#commit-body-template)
      - [Pull Request](#pull-request)
    - [Reviewing](#reviewing)
      - [Change Request](#change-request)
      - [Approving](#approving)
  - [Code of Conduct](#code-of-conduct)
    - [We all are here to learn](#we-all-are-here-to-learn)
    - [We are responsible for our code](#we-are-responsible-for-our-code)
    - [Make PR reviews before start to work](#make-pr-reviews-before-start-to-work)
    - [Do your homework beforehand](#do-your-homework-beforehand)
    - [Reviewing Pull Request](#reviewing-pull-request)
    - [Reporting issues](#reporting-issues)
  - [Who is involved](#who-is-involved)
  - [Where can I ask for help](#where-can-i-ask-for-help)
  - [Links references](#links-references)

</details>

---

## TLDR

1. [Comms](#comms)
2. [Environment details](#environment-details)
3. [Branch name pattern](#name-pattern)
4. [Atomic commits](#atomic-commits)
5. [Commit title](#commit-title)
6. [Commit body](#commit-body)
7. [Include notes and instructions for your contribution in Pull Request](#in-pull-request)
8. [Include notes and instructions for your contribution in the codebase](#in-the-codebase)
9. [Creating a Pull Request](#creating-a-pull-request)
10. [Make PR reviews before start to work protocol](#make-pr-reviews-before-start-to-work-protocol)
11. [The PR owner merges it](#the-pr-owner-merges-it)
12. [Code formatting](#code-formatting)

---

## Links to important resources

This section will be populated soon

### Docs

This section will be populated soon

### Bugs

This section will be populated soon

### Comms

1. [ft_transcendence Discord Server][Discord Server]
   1. Please follow our Discord Server's rules (_post in correct channel, create thread, mention, etc_)
2. [ft_transcendence GitHub Project][GitHub Project]
   1. Please use the appropriate labels, assignee and importance.

### Tools

<details>
<summary>Click to display Tools info</summary>

#### Debugging tools

1. [JSON Web Token (JWT) Debugger][JWT Debugger]

#### Code sharing tools

1. [Pastebin with track and expiration][Ghostbin]
2. [Pastebin with track and expiration][Pastee]
3. [Pastebin with preview and edit][Rentry]
4. [Pastebin with preview and expiration][Privatebin]

#### File sharing tools

1. [Image sharing][ImGur]
2. [Big file sharing][WeTransfer]

#### Drawing tools

1. [tldraw - Free whiteboard][tldraw]
2. [Excalidraw - Free whiteboard][Excalidraw]
3. [Miro - Collaborative whiteboard][Miro]
4. [Mural - Collaborative whiteboard][Mural]
5. [Canva - Collaborative whiteboard][Canva]

#### Research tools

1. [Freedium - Breaking Medium paywall][Freedium]

#### Note taking tools

1. [Obsidian - Local markdown note-taking app][Obsidian]
2. [Logseq - Local markdown note-taking app][Logseq]
3. [Notion - Remote markdown note-taking app][Notion]
4. [Dendron - VSCode extension for markdown note-taking][Dendron]
5. [Foam - VSCode extension for markdown note-taking][Foam]

#### Miscellaneous tools

1. [Emojipedia - Emoji library][Emojipedia]
2. [Emojis Wiki - Emoji library][Emojis Wiki]
3. [ASCII Tree Generator][ASCII Tree Generator]
4. [Folder Tree Generator][Folder Tree Generator]

</details>

---

## Environment details

1. Currently, we're using a encryption/decryption script named `ft_crypt.sh`for managing sensitive files. You must have it to be able to decrypt the encrypted files (`.env` and secrets `.txt`). Please check its configuration instructions in our [Discord Server][Discord Server]
2. When "installing" Node packages, check first if there's a `package-lock.json` file in the folder:
   1. If YES: clean install them with: `npm ci`
   2. If NO: install them with: `npm install`
   3. For _"adding new packages"_, you must run `npm install <package_name>`
3. Follow our [README.md] instructions.

---

## Testing

This section will be populated soon

---

## How to

### How to submit changes

#### Branch naming

<details>
<summary>Click to display Branch naming info</summary>

##### Name pattern

1. Branches should be **named according to this pattern**:
  `Initials + "_" + MonthNumber +  DayNumber + "_" + Type(e.g: FEAT/FIX/REFACT/STYLE/DOCS/BREAKING/MISC) + "-" + ShortBranchPurposeDescription`
    E.g:
    - `mr_0419_DOCS-Contributing.md`
    - `gd_0302_FEAT-Tailwind`
    - `bs_0228_FEAT-KillerAi-to-scare-players`
2. Then the name could be read like this:
   1. `[Owner]_[Month][Day]_[TYPE]-[Description]`
3. This makes easier to identify owner, branch lifetime, main purpose and description by a quick glance (in GitHub, CLI, etc) without the need to ask, check in GitHub branches, CLI combined commands (`git for-each-ref`...)
4. Also, it follows alphabetical order and similar name pattern so easier to refer to it via CLI too.

> [!WARNING]
>
> If your branch is going to introduce a **breaking change** (e.g: rename a route, require more/less params, _your PR changes will brake others work_), use `[BREAKING]` as branch's Type.
> [!TIP]
>
> 1. Initials could be **N**ame**L**astname (e.g: `bs`, `fs`, `gd`, `ig`, `mr`) or a short nickname.
> 2. If you created a branch to "test" or "play around" with the code and need to push it to save your work; use `TEST` as branch's Type (_but don't forget to **rename it or delete it** later_).

</details>

#### Committing

<details>
<summary>Click to display Committing info</summary>

1. You can check these sources for commit messages best practice:
   1. [Free Code Camp](https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/)
   2. [Baeldung](https://www.baeldung.com/ops/git-commit-messages)
   3. [ConventionalCommits](https://www.conventionalcommits.org/en/v1.0.0/)

##### Atomic commits

<details>
<summary>Click to display Atomic commits info</summary>

1. Make **"atomic"** commits or at least related logic commits.
   - E.g:
     - `commit1` FEAT
     - `commit2` REFACT
     - `commit3` STYLE
2. It make **easier to review** code by separating the intention (logic, formatting, refactor, etc).
3. Since is possible to navigate through the code selecting the commits, then your PR has more chances to be reviewed sooner.

> [!TIP]
>
> 1. You need to leave, save your work or just do an emergency commit?
>    Then you can commit and push, but later amend it. (e.g: `git reset HEAD~1`)(note that you'll have to do a `push --force` later).
> 2. You went crazy and mixed logic, formatting, etc or just added too much changes (didn't respected "atomic" commit rule) but **NOT COMMITTED yet**?
>    Then you can perform an interactive commit: `git add -p <filename>`
> 3. You did a mess **in your branch**?
>    Then you can perform an interactive rebase: `git rebase -i HEAD~X` (where `X` is the number of commits to modify)

</details>

##### Commit title

<details>
<summary>Click to display Commit title info</summary>

1. Add a **meaningful commit title** (_and not too long_). It's easier to check the intention of the commit.
   1. If you add a **"commit type"**, then navigation/check/filter through commits history becomes way easier.
      > [!TIP]
      > These are some examples:
      > - `FIX: Fixed xx error`,
      > - `STYLE: Applied Prettier formatting`
      > - `REFACT!: Added versioning to routes (BREAKING CHANGE)`
      > - `FEAT: Solved the whole transcendence by myself`
      > [!IMPORTANT]
      > 1. Please be consistent with the **"commit type"** naming and formatting.
      > 2. If the commit introduces a **breaking change**, append a `!` after the type.
   2. The commit-type is **UPPERCASE and followed by colon**. Currently we're using these commit-types (_basically the same as branches types_)
      1. `CHORE:` The commit is for performing a basic task (adding some new types, implementing a function inside another)
      2. `FEAT:` The commit is for adding a feature.
      3. `FIX:` The commit is for fixing a bug.
      4. `REFACT:` The commit is for refactoring a function/feature (shortening, splitting, accepting more/less parameters, etc).
      5. `STYLE:` The commit is for applying "Prettier", "cSpell", removing comments, removing old code (try yo comment-out these), changing names.
      6. `DOCS:` The commit is for adding/modifying/removing documentation.
      7. `MISC:` The commit don't fit in the previous categories.
    > [!NOTE]
    > If you have an useful type, let us know to start using it.
2. You can go to `Source Control` extension and easily navigate through the code and check why now the code is failing, or how the problem was solved.
3. **Your future self and everyone** will appreciate when checking the repo graph or running `git log --oneline` or `git log --graph --abbrev-commit --decorate --oneline` and everything looks nice, ordered and easy to understand and navigate.
4. See some examples here: [Commit Title Templates](#commit-title-template)

</details>

##### Commit body

<details>
<summary>Click to display Commit body info</summary>

1. Sometimes the commit title is not enough and/or is too long; so we can make it shorter and elaborate in the commit body.
2. To do so, you can:
   1. Run `git commit` (no flags here) then your configured editor will be opened and you can type a beautiful and well formatted commit message. _Note that the 1st line is for the title and the others are for the body_.
   2. Run `git commit -m"<Commit_Title>" -m"<Commit_Body>"` (note that the 2nd `-m` is for adding a body to a commit)
3. Separate the subject from the body with a **blank line**.
4. If your commit introduces a **breaking change**, add a footer `BREAKING CHANGE:` with the breaking change explanation.
5. Currently we don't have more body guidelines; but later, we could implement them (e.g: if test passed, GitHub issue links, etc).
6. See some examples here: [Commit Body Templates](#commit-body-template)

</details>

</details>

#### Include notes and instructions for your contribution

<details>
<summary>Click to display notes and instructions for your contribution info</summary>

##### In Pull Request

1. Your Pull Request should have a meaningful description of its purpose.
2. If you consider it useful; you can also add article links to base your decisions (why you did what you did).
3. If your PR solves issues; then please link them to it:
   1. In the PR description, you can link them via the issue's keyword. ([help?](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword))
   2. In the PR page, go to right sidebar, then click on **Development**. ([help?](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#manually-linking-a-pull-request-to-an-issue-using-the-pull-request-sidebar))
4. If your PR "needs" instructions to be tested, then please add them to its description (_consider adding a README.md file for it later_)
5. If your PR has "bugs", missing validations or will need "features" and/or "enhancements"; please create issues for them in our [GitHub Project][GitHub Project] and **mention** them (**NOT link** them because they'll get close if merging current PR). This will lets the reviewer know that you think of it, avoiding time loss (_comments, change requests, resolve conversations, etc_)
6. Try to structure well the PR description body so it's easy to read (_it'll be on the commits history_).
7. We have some _**Pull Request Templates**_, so please use them.
8. See some examples here: [Pull Request Templates](#pull-request)

##### In the codebase

1. If it's a service/script/set-up and it needs to be configured and/or used in an specific way, consider adding a `README.md` file to its root folder. Everyone will appreciate to have some documentation to use your service. (_How many times we complained about MiniLibX not having a correct manual; or estrange-written MAN pages of our LibFT Unix functions_).
2. If your function is not self-descriptive or hard to understand; include some comments for it. Your future self and the team will appreciate it when reviewing it (_specially when +2weeks have passed since you code it_).
3. This will save you time because you won't need to explain (_or at least not too much/often_) the purpose of your contribution and how to make it work. And everyone won't need to wait for you to explain it, make it work, or spend their time figuring it out.

</details>

#### Pull Request protocol

<details>
<summary>Click to display Pull Request protocol info</summary>

##### Creating a Pull Request

1. We have some _**Pull Request Templates**_, so please use them.
2. We have the label "**on-hold**" in case you need to explicitly announce that a certain PR should not be merge yet.
3. When creating a Pull Request, please use the appropriates labels (_e.g: "breaking change", "code clean-up", etc_).
4. If you're changing someone's code, you should add him as a your PR reviewer. Also, if you know that someone has a wider knowledge of a key aspect of your PR, add him too.
5. Currently we have an automated reviewer assignation through "Code Owners" ([more info here](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)). So to **keep that in sync** with the project growth; remember to **update the file** located at the root of the repo (`.github/CODEOWNERS`) when you start to develop a service, or working together in specific files.
6. If you're going to "update" someone's branch, please issue a Pull Request to his branch instead of directly pushing to it.
7. See some examples here: [Pull Request Templates](#pull-request)

##### Make PR reviews before start to work protocol

1. We all want fast feedback to our contributions (_and hopefully feel the happiness to watch our code be merge into the codebase_); so lets **start from ourselves** and review someone's PR.
2. In this way; our contribution will be checked sooner, code will be improved/fixed sooner, contribution rhythm will be stable and the project development will grow faster.
3. Faster feedback = less deviation from main common goal = less time wasted.

> [!NOTE]
> If you review PRs more than once during the day, it'll be greatly appreciated.

##### The PR owner merges it

1. This mean that you take your time making sure you gathered enough feedback from different sources.
2. It’s **your way of taking due responsibility for what happens next** (solving merge conflicts, running test, automated builds and/or deployments that might be triggered by the merge).

##### More Long Living Branches More Merge Conflicts

1. Our branches should be **single-purpose and short-living**.
2. Long-living branches increases the time and the amount of code staying in a divergent state, which increases chances of merge conflicts.
3. This is easier to identify by our [Branch naming convention](#branch-naming)

##### The Reviewability of a Change Decreases With Size

1. It's easier to check a 100 lines of code, than 300 (specially if we're 5 members), so your PR would probably be reviewed faster and you'll get feedback sooner.
2. In this way, everyone can be **aware sooner** of new features and fixes; the feedback will be helpful for all because it helps to keep a coding and quality standard, **correct and/or restructure our course of action** (so we don't lose too much time in something that won't be accepted or removed later).
3. Also, we'll appreciate it when we start to work on the project (check our [Make PR reviews before start to work convention](#make-pr-reviews-before-start-to-work))

<details>
<summary>Click to display sources</summary>

- Inspiration came from the following web pages:
  - [I Merge My Own Pull Requests](https://sam-cooper.medium.com/i-merge-my-own-pull-requests-3001fe247be2)
  - [Code Review Workflow](https://softwareengineering.stackexchange.com/questions/334488/code-review-workflow-where-pull-request-author-must-merge)
  - [GitHub, who merges?](https://www.reddit.com/r/learnprogramming/comments/18ekp5s/github_who_merges/?rdt=65197)
  - [Pull Requests—The Good, the Bad and Really, Not That Ugly](https://productive.io/engineering/pull-requests-the-good-the-bad-and-really-not-that-ugly/)

</details>

</details>

### How to report a bug

1. For reporting a bug, please write an issue in our [GitHub Project][GitHub Project]. We have a custom _**bug report template**_ that you can use.
2. If it's a big problem, or no attention is given; please report it also in our [Discord Server][Discord Server]

### How to request a feature

1. For requesting a feature, please write an issue in our [GitHub Project][GitHub Project]. We have a custom _**feature request template**_ that you can use.
2. If it's crucial, or no attention is given; please report it also in our [Discord Server][Discord Server]

---

## Style Guide and Coding conventions

### Folders and files

<details>
<summary>Click to display Folders and files info</summary>

#### Organization of folders and files

1. We're using **Service-Based Organization**
   1. Each service has it's "docker" and "src" folders. **docker** has all docker related files (Dockerfile, .env, secrets, scripts, configs). **src** has only source code.
   2. It'd look something like this:

    <details>
    <summary>Click to display structure</summary>

        ```
        Makefile
        microservices/
        ├─ service1/
        │  ├─ src/
        │  │  ├─ service1code.ts
        │  ├─ docker/
        │  │  ├─ Dockerfile
        ├─ service2/
        │  ├─ src/
        │  │  ├─ service2code.ts
        │  ├─ docker/
        │  │  ├─ Dockerfile
        docker-compose.yml
        ```
        
    </details>

2. This have the advantage that related files are together. So if a change is needed in one service, then probably we only need to `cd` into its folder and look in it. It also reduces Docker `context` issues, complex path traversals, etc.
3. You can check [this article](https://docker-compose.de/en/folder-structure/) if you're interested some different structures.

##### Root of the repo

1. "Services" (_e.g: users, chat, front-end, etc_) go inside the `microservices` folder.
2. General tools (_e.g: example scripts, utility scripts, templates, etc_) go inside `tools` folder.

##### Services folders

<details>
<summary>Click to display Services folders info</summary>

1. Each service should have its `src` folder and its `docker` folder.
2. The idea is to be able to run the service as if one were developing on it.
3. `src` folder will contain the source code.
4. `docker` folder will contain docker related stuff that's needed to run the service in Docker.
5. The service's **root** folder will contain `docker-compose.yml` and all other file/folders and dependencies needed to run the service.

###### src folder

1. It should contain only source code.

###### docker folder

1. It should contain the `Dockerfile`, developer-generated `.env` files, secrets, config files and scripts.
2. We must decide how we're going to configure the microservices:
   1. If we're going to configure the microservices individually.
   2. If we're going to have a unique big `.env` file
   3. If we're going to support default values in the microservices that will be taken unless different ones are passes through `docker compose` or another method.

###### Service root folder

1. It should contain the `docker-compose.yml`, `.dockerignore`, and related dependencies (files/folders) for the service to run.
2. Consider to add a `README.md` file for easier run, check, setup and debug.
3. Consider to add a `Makefile` for setting-up the service locally, cleaning leftovers, etc. We could later `include` it to the "**main**" makefile and call yours from it.

</details>

#### Naming of folders and files

1. The folder/file name should be short but meaningful.
2. Try to always use [snake_case](https://en.wikipedia.org/wiki/Snake_case) (lowercase names `_` instead of whitespace).
3. Services' folder should be name according to the service
   1. E.g: `users`, `pong`, `frontend`.
4. The compiled code (JavaScript code) should be placed in a folder named `dist`. (it's a name standard and [vite](https://vite.dev/guide/) creates its by default)
5. Use underscore (`_`) over dash (`-`) because it's easier to select the full name by clicking it. You can try it yourself with these examples:
   1. `try-to-fully-select-me-with-a-single-click`
   2. `try_to_fully_select_me_with_a_single_click`

</details>

### Functions and variables

<details>
<summary>Click to display Functions and variables info</summary>

#### Organization of functions and variables

1. In Constructors, vars should be initialized in the same order they were declared (easier to follow)
2. Try to group type definitions by function use, grouped on top/bottom of the file, etc (easier to follow)
3. Try to place "fixed values" vars in a same file (e.g: `schema.ts`) so it's easier to update them in the future, and we won't need to go through the whole code looking for them.
4. Try to "link" variables:
   1. Variables that they depend on, or are similar to; try to extract similar logic and create a "base var", so when updating it, you only need to update in one place.
   2. E.g: `UserPublicFields`(id, username) -> `UserField`(UserPublicFields, mail, rememberMe, friends) -> `UserQueryOptions`(UserField, order, skip, take)

#### Naming of functions and variables

1. The function/var name should be short but meaningful.
2. Try to always use [camelCase](https://developer.mozilla.org/en-US/docs/Glossary/Camel_case) (1st letter of each word is capitalized instead of whitespace).
3. Try to prefer underscore (`_`) over dash (`-`) because it's easier to select the full name by clicking it. You can try it yourself with these examples:
   1. `try-to-fully-select-me-with-a-single-click`
   2. `try_to_fully_select_me_with_a_single_click`
4. Lets try to use a similar naming convention as the [42-Norm](https://cdn.intra.42.fr/pdf/pdf/96987/en.norm.pdf) and **prepend** the initials:
   1. Enums = E
   2. Interface = I
   3. Abstract = A

</details>

### Code formatting

1. Read our [README_DEV.md]
2. To format the code according to our standard, run "Prettier" (_install it via VSCode Extension, npm package, etc_).
   1. The file `.prettierrc`, `.vscode/settings.json` and `.editorconfig` located at the root of the repo are needed to configure the formatting.
3. Also use "Code Spell Checker" to check for spelling mistakes.
   1. For adding "unknown words", add them to `.custom-words.txt` file manually or via VSCode pop-up "Quick-Fix" recommendation.
   2. Try to avoid using non-English words, and adding too many abbreviations.

---

## Templates

### Reporting

<details>
<summary>Click to display Reporting info</summary>

#### Issue report

This section will be populated soon

#### Bug report

1. We have a _**Bug Report Template**_, so please use it.

#### Feature request

1. We have a _**Feature Request Template**_, so please use it.

</details>

### Contributing

<details>
<summary>Click to display Contributing info</summary>

#### Commit

##### Commit title template

1. Examples:
   1. `STYLE: Removed old comments, commented-out code and some TODO comments`
   2. `REFACT: Refactored UserField type to use UserPublicField. Used in UserQueryOptions (service)`
   3. `FEAT: Added support for "schema sanitation" to nested objects and array of objects`
   4. `CHORE: Implemented function to sanitize input (empty fields to undefined)`
   5. `DOC: Added template section to Contributing.md`
2. See more at: [Commit Title How-to](#commit-title)

##### Commit body template

<details>
<summary>Click to display Commit body template examples</summary>

```sh
FIX: Fixed coercion logic broken by blankToUndefined()
Now I manually ".coerce()" the fields inside blankToUndefined().
I have to do this because .preprocess() removed coerce logic.
```

```sh
FIX: Fixed coercion logic broken by blankToUndefined()

Now I manually ".coerce()" the fields inside blankToUndefined().
I have to do this because .preprocess() removed coerce logic.
```

```sh
FIX: Fixed field validation for PATCH method

- Password validation logic is now in checkPasswordConstraints() helper function.
- It's used in createUser() and updateUser() for password constraints validation (no username/email in password).
- Commented out old validation logic in createUserSchema.
- Unified putUserSchema as equal to createUserSchema (they have the same logic).
```

```sh
FEAT: Added entrypoint script along with its database seeder

- entrypoint.sh is a script intended to be used as entrypoint script.
It has the logic to:
Receive flags as arguments.
Read values from environment and docker secrets.
Execute other scripts (spawns a subshell).
Extensive logging/debugging prints.
Redirect output to specific files.
Print whole environment, and tell if it's inside a container or not.
- fill_db.py is a script intended to fill the database.
It has the logic to:
Receive flags as arguments.
Fill database from user input (interactive) or from file.
Issue POST request against an API endpoint.
```

See more at: [Commit Body How-to](#commit-body)

</details>

#### Pull Request

1. We have some _**Pull Request Templates**_, so please use them.
2. The following templates are available for you to use
   1. 💥 Breaking Change
   2. 🐛 Bug fix
   3. 📝 Documentation
   4. 🚀 Feature
   5. 🧩 Miscellaneous
   6. ♻️ Refactor
   7. 🎨 Style
3. See more at: [Branch Naming How-to](#branch-naming)

<details>
<summary>Click to display Commit Pull Request template examples</summary>

```markdown
This branch implements  type definitions **centralization**
---
Mostly in the schema (`user.schema.ts`).

It defines the types and export them (as needed) to adhere to **DRY** (**D**on't **R**epeat **Y**ourself).
So one change is reflected on all variables that depends on it.

> [!NOTE]
> It also fixes the following bugs:
> - Empty strings in some query params (_"name", "useFuzzy", "useOr", "skip", "take", "sortBy", "order"_) were taken into account instead of rejecting them (e.g: `http://localhost:3000/api/users/?skip=` valid. **Note the `skip=`**).
> - "Invalid" vales could be passed to id. E.g: `-42`, `0`.

This branch closes the following issues:
---
- [ ] #136
  - [x] #137
  - [x] #138
  - [ ] #139
```

```markdown
two AI endpoints
- for subject mandatory AI
- for extra modes
```

```markdown
## This PR implements the chat feature

It includes:

- Subject requirements covered
- Invite functionality implemented as discussed

---

## Usage Instructions

- Use `make` to start the server
- Connect to the server using Postman
- WebSocket connection URL: `ws://localhost:3002/ws`
- Communication protocol is provided in the `README.md`

### Example request body:

{
  "message": "message content",
  "relatedId": "UUID of user"
}

Note: UUIDs are currently generated by the server as random names.
Additional features can be added upon request.
Please let me know if you need any clarification!
```

See more at: [Include notes and instructions for your contribution](#include-notes-and-instructions-for-your-contribution)

</details>

</details>

### Reviewing

<details>
<summary>Click to display Reviewing info</summary>

#### Change Request

This section will be populated soon

#### Approving

This section will be populated soon

</details>

---

## Code of Conduct

### We all are here to learn

1. Be humble, provide good arguments for your **statements** and accept constructive comments.
2. None of us is a +10y senior developer; so expect mistakes and conversations for restructure our course of action.
3. We're not being paid; so our reward is the knowledge we get from the project and our teammates. **Be sure to give as you get**. so the best way to keep motivation is feeling happy when interacting with the teammates. **Feeling happy, respect, compromise and complicity makes a strong team**.

### We are responsible for our code

1. We have to **take responsibility for the code we submit**; that means we should handle errors that our code could encounter during execution, being them generated inside our code, by user input, by receiving wrong arguments, by someone;s code using wrongfully our code, etc. So we should validate against that. Others don't know our code's logic better that we do (**we coded it!**) so it's **our responsibility** to checks against those types of errors.
2. We must know what we're doing. This programming journey is full of new things, so if we're implementing something, using a package, a module, a program, etc; we should know its basic to at least explain to the other team members why we're doing what we're doing.

### Make PR reviews before start to work

1. Check our [Pull Request protocol](#pull-request-protocol)

### Do your homework beforehand

1. It’s OK not to know things, but show that you tried. Before asking for help, be sure to check the project’s  [Docs](#docs), [Issues][Project issues] (open or closed), [Comms](#comms) channels, and search the internet for an answer. People will appreciate it when you demonstrate that you’re trying to learn **but you also consider that their time is valuable**.

### Reviewing Pull Request

1. When **Approving** a PR:
   1. If the PR is urgent, its owner is not on campus, etc; you could notify him through our [Discord Server][Discord Server]

2. When submitting a **Change Request**:
   1. If your change request is not obvious; please explain briefly why you're requesting it, which benefits brings your request.
   2. If for some reason you and the PR owner don't agree; you can post a message, open a thread or create a poll in our [Discord Server][Discord Server]
   3. If the PR is urgent, its owner is not on campus, etc; you could notify him through our [Discord Server][Discord Server]
   4. Some useful links for Pull Request reviews (_multi-line comments, file comments, suggestions_):
      1. [GitHub - About pull request reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)
      2. [GitHub - Reviewing proposed changes in a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request)
      3. [GitHub - Commenting on a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request)
      4. [Rewind - Best Practices for Reviewing Pull Requests in GitHub](https://rewind.com/blog/best-practices-for-reviewing-pull-requests-in-github/)
      5. [YouTube - How to Review a Pull Request on GitHub](https://www.youtube.com/watch?v=TO9xK4XTBbQ)
      6. [YouTube - How to Review a Pull Request Like a Senior Developer](https://www.youtube.com/watch?v=LheeJPkdCu8)

### Reporting issues

1. Please mainly report in our [Comms](#comms) channels.
2. Reporting bugs
   1. Report the bug in our Discord server, and in our GitHub Project.
   2. When submitting a bug report, please follow our [Bug report](#bug-report) guides, and include a good description of the bug.
   3. You could also share some screenshots / videos, upload them (e.g: our bugs channel in Discord, GoogleDrive, ImgGur, etc) and provide the link in your report.
3. Reporting issues:
   1. Report the bug in our Discord server, and in our GitHub Project.
4. When reporting in our GitHub Project:
   1. Please use the correct labels so we can easily filter and identify them.
   2. They are organized in subjects as follows:

<details>
<summary>Click to display labels category info</summary>

    1. Reporting
      1. duplicate
      2. bug
    2. Pull Request
      1. feature
      2. bugfix
      3. breaking change
      4. code clean-up
      5. documentation
    3. Actions:
      1. question
      2. research
      3. suggestion
    4. Status:
      1. outdated
      2. on-hold
      3. help wanted
      4. invalid
      5. abandoned
      6. wontfix
    6. Project specific:
      1. major module
      2. minor module
      3. frontend
      4. backend
      5. database
      6. devops

</details>

---

## Who is involved

<img src="https://github.com/benszilas.png" width="64" style="border-radius: 50%;" alt="Benjámin Szilas" /> [Benjámin Szilas](https://github.com/benszilas)

<img src="https://github.com/gabrieldanis.png" width="64" style="border-radius: 50%;" alt="Gabriel Danis" /> [Gabriel Danis](https://github.com/gabrieldanis)

<img src="https://github.com/Sekula34.png" width="64" style="border-radius: 50%;" alt="Filip Seleš" /> [Filip Seleš](https://github.com/Sekula34)

<img src="https://github.com/ismayilguliyev28.png" width="64" style="border-radius: 50%;" alt="Ismayil Guliyev" /> [Ismayil Guliyev](https://github.com/ismayilguliyev28)

<img src="https://github.com/marcorondong.png" width="64" style="border-radius: 50%;" alt="Marco Rondón" /> [Marco Rondón](https://github.com/marcorondong)

---

## Where can I ask for help

1. Take a look at our [Comms](#comms) channels.

---

## Links references

[GitHub Project]: https://github.com/users/marcorondong/projects/1

[Discord Server]: https://discord.com/channels/1267824540638249053/1267824540638249057

[Project issues]: https://github.com/marcorondong/transcendence2.0/issues

[JWT Debugger]: https://jwt.io/

[Ghostbin]: https://www.ghostbin.cloud/

[Pastee]: https://paste.ee/

[Rentry]: https://rentry.co/

[Privatebin]: https://privatebin.net/

[ImGur]: https://imgur.com/

[WeTransfer]: https://wetransfer.com/

[tldraw]: https://www.tldraw.com/

[Excalidraw]: https://excalidraw.com/

[Miro]: https://miro.com/app/dashboard/

[Mural]: https://app.mural.co/t/transcendence3115/home

[Canva]: https://www.canva.com/

[Freedium]: https://freedium.cfd/

[Obsidian]: https://obsidian.md/

[Logseq]: https://logseq.com/

[Notion]: https://www.notion.com/

[Dendron]: https://www.dendron.so/

[Foam]: https://foambubble.github.io/foam/

[Emojipedia]: https://emojipedia.org/

[Emojis Wiki]: https://emojis.wiki/

[ASCII Tree Generator]: https://ascii-tree-generator.com/

[Folder Tree Generator]: https://www.sickrate.com/folder-structure-generator

[README.md]: ./README.md

[README_DEV.md]: ./README_DEV.md
