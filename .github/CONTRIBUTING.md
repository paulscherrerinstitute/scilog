# Contributing to SciLog

Thank you for considering contributing to SciLog! By contributing, you agree to follow our contribution guidelines.

## 1. Code of Conduct

Please adhere to the [Code of Conduct](./CODE_OF_CONDUCT.md) in all interactions with the project.

## 2. Licensing of contributions

By contributing, you agree that your contributions will be licensed under
the project's license. See the [License section of the README](../README.md#license)
for which license applies to which package.

## 3. How to Contribute

You can contribute by:

- Reporting bugs
- Suggesting improvements or new features
- Submitting Pull Requests

## 4. Pull Requests

- All contributions must be made via **pull requests (PRs)**.
- PRs can come either from a **fork** of the repository or from a **branch** within this repository.
- PRs are expected to be **atomic**—each PR should contain only one logical change.
- **Codeowners** will automatically be added as reviewers.
- You may add any additional reviewers if needed.
- Make sure to address any comments before merging.
- **Continuous Integration (CI) must pass** before a PR can be merged.
- PRs will be **squashed and merged**.
- The squashed commit should follow **Conventional Commit style**. See here the
  [specification](https://www.conventionalcommits.org/en/v1.0.0/).
- Include 'what' and 'why' in the commit body to document the rationale behind the change. 
This provides essential context for future maintenance and helps others understand the project's growth.
- By default, the PR title serves as the commit’s title, while the PR description populates
the commit body.
- PR title and description are checked by [commitlint](https://commitlint.js.org/)
  (rules in [`.commitlintrc.yaml`](../.commitlintrc.yaml)): the title aims for
  50 characters (hard limit 72, including the `type(scope): ` prefix and the
  ` (#123)` GitHub appends on merge) and the description is required. Wrapping
  description lines at 72 keeps `git log` readable, but it isn't checked.
  The scope is the package you changed: `api`, `web` or `sdk`. Omit it when a
  change spans several packages or touches none (e.g. CI, docs site, root config).
  Renovate PRs are exempt.
- To check a message locally (see commitlint's
  [CLI primitives](https://commitlint.js.org/guides/ai-agents.html#cli-primitives-for-agents-and-automation)):

  ```sh
  npx commitlint --last                              # your last commit
  printf '%s' "feat(api): add x" | npx commitlint    # a draft message
  npx commitlint --print-config json                 # the resolved rules
  ```

  The PR check also counts the ` (#123)` suffix, so a title that passes
  locally at 66–72 characters fails on the PR.

## 5. Additional Guidelines

- Ensure your changes include **documentation updates** when relevant.
- Follow **existing code style and patterns** in the project.
- Keep PRs **focused and concise** to make reviewing easier.

## 6. Reporting Issues or Security Concerns

- For **security issues**, please follow the instructions in [SECURITY.md](./SECURITY.md).
- For other issues or feature requests, use the
  [GitHub Issues page](https://github.com/paulscherrerinstitute/scilog/issues).
