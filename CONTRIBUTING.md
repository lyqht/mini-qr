# Contributing to Mini QR

Thank you for your interest in contributing to the Mini QR project! Contributions from the community are welcome to help improve and enhance this tool.

You can work on existing issues or suggest new ones. You can also share your presets with the world by referring to [this section](#adding-new-presets).

Before you start, please take a moment to read through these guidelines.

- [Contributing to Mini QR](#contributing-to-mini-qr)
  - [Basic Guidelines](#basic-guidelines)
    - [Issue Assignment](#issue-assignment)
    - [Reporting Bugs or Suggesting Improvements](#reporting-bugs-or-suggesting-improvements)
  - [Development environment](#development-environment)
    - [Getting started with local development](#getting-started-with-local-development)
    - [Codebase overview](#codebase-overview)
  - [End-to-End (E2E) Testing](#end-to-end-e2e-testing)
  - [Adding new presets](#adding-new-presets)
  - [Contributing Translations](#contributing-translations)
    - [Getting Started with Crowdin](#getting-started-with-crowdin)
    - [Adding a New Language](#adding-a-new-language)
    - [Translation Status](#translation-status)
  - [License](#license)
  - [Code of Conduct](#code-of-conduct)
  - [Final Note](#final-note)

## Open-source etiquette

> Please read the [official MDN docs for open source etiquette](https://developer.mozilla.org/en-US/docs/MDN/Community/Open_source_etiquette), if you're new to contributing to open source projects.

### Reporting Bugs or Suggesting Improvements

- If you find a bug or want to suggest an improvement, please raise an issue.
- For bug reports, provide clear steps for reproduction.
- For improvement suggestions,
  - Include mockups if the change is UI-based.
  - For self-hosting related feature requests, please note that I, the main project maintainer (@lyqht) will likely not work on those. This is because I do not have docker expertise and I don't really have an interest to learn it. The current docker images are setup by kind public contributors. Thanks for your understanding!

### Issue Assignment

- Always request to be assigned to an issue before working on it. This helps prevent conflicting and duplicate work.
- Comment on the issue you'd like to work on, asking to be assigned.
- Wait for [@lyqht](https://github.com/lyqht) to assign you before starting work.

## Development environment

### Getting started with local development

1. Fork the repository and clone it to your local machine.
2. Install the necessary dependencies by running `pnpm install`. If you don't have pnpm installed, you can install it by running `npm install -g pnpm`.
3. Start the development server by running `pnpm dev`.
4. Create a new branch for your contribution, preferably with a name related to the issue you're working on. e.g. `author/issue-description`.
5. Create a pull request for that branch, with the base branch set to `main`. Ensure that commit messages are clear and concise.

Note that your changes may be modified by the maintainer to ensure consistency and best practices. The maintainer may also update documentation(README.md) on your PR.

### Codebase overview

The project is a modern Vite-powered Vue.js 3 application with TypeScript support and Tailwind CSS for styling. Here's an overview of the main directories and files:

**Entry Points:**

- `src/main.js`: Application entry point that initializes Vue app
- `src/App.vue`: Main application component with comment regions for different functionality:
  - Scroll-aware header functionality
  - App mode switching (Create/Scan)
  - Component integration and routing logic
- `index.html`: Main HTML template

**Components (`src/components/`):**

- `QRCodeCreate.vue`: Main component for QR code creation with extensive customization options
- `QRCodeScan.vue`: Component for scanning QR codes via camera or file upload
- `StyledQRCode.vue`: Component that renders the actual QR code output
- `QRCodeFrame.vue`: Component for adding frames around QR codes
- `DataTemplatesModal.vue`: Modal for managing QR code data templates
- `VCardPreview.vue`: Preview component for vCard QR codes
- `QRCodeCameraScanner.vue`: Camera-based QR code scanning functionality
- `CopyImageModal.vue`: Modal for copying QR code images
- `AppFooter.vue`: Application footer component
- `MobileMenu.vue`: Mobile navigation menu
- `LanguageSelector.vue`: Language selection component
- `ui/`: Directory containing auto-generated UI components from radix-vue (don't modify these)

**Utilities (`src/utils/`):**

- `presets.ts`: QR code style presets and preset management
- `dataEncoding.ts`: Data encoding/decoding utilities for different QR code types
- `convertToImage.ts`: Image conversion and export utilities (PNG, JPG, SVG)
- `csv.ts`: CSV parsing and validation for batch operations
- `i18n.ts`: Internationalization setup and utilities
- `language.ts`: Language detection and management
- `useDarkModePreference.ts`: Dark mode preference management
- `color.ts`: Color utility functions
- `formatting.ts`: Text formatting utilities

**Library utilities (`src/lib/`):**

- `utils.ts`: Shared utility functions

**Styles:**

- `src/style.css`: Main application styles
- `src/index.css`: Additional base styles
- Tailwind classes used throughout components
- Component-specific styles in `<style>` blocks within Vue files

**Assets (`src/assets/`):**

- `vue.svg`: Vue logo
- `placeholder_image.png`: Placeholder image for QR codes
- `presets/`: Directory for preset-related assets

**Public assets (`public/`):**

- Sample CSV files for batch operations
- App icons and favicons
- Demo videos and preview images
- `CHANGELOG.md`: Version changelog

**Testing (`tests/`):**

- `e2e/`: End-to-end tests using Playwright
  - `create.spec.ts`: Tests for QR code creation functionality
  - `app.spec.ts`: General application tests
  - `fixtures/`: Test fixture files
  - `*.spec.ts-snapshots/`: Visual regression test snapshots

**Configuration files:**

- `vite.config.js`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json` & `tsconfig.node.json`: TypeScript configuration
- `playwright.config.ts`: Playwright testing configuration
- `vitest.config.ts`: Vitest unit testing configuration
- `components.json`: Radix Vue components configuration
- `.eslintrc.cjs`: ESLint configuration
- `.prettierrc.json`: Prettier formatting configuration

**Internationalization:**

- `locales/`: Translation files for different languages
- Integration with Crowdin for community translations

**Important Notes:**

- The actual QR code output includes a wrapper around `StyledQRCode.vue`, which can be found by `id="qr-code-container"` in `src/App.vue`
- The project uses TypeScript throughout for better type safety
- UI components in `src/components/ui/` are auto-generated from radix-vue and should not be modified manually
- The application supports both light and dark themes with system preference detection

## End-to-End (E2E) Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

**Running Tests:**

To run all E2E tests, use the following command:

```bash
pnpm test:e2e
```

**Writing Tests:**

- Tests are located in the `tests/e2e` directory.
- Use clear and descriptive test names.
- Utilize Playwright's locators (e.g., `getByRole`, `getByLabel`, `getByText`, IDs) for selecting elements robustly.
- Avoid relying on brittle selectors like complex CSS paths or auto-generated class names.
- Use `test.beforeEach` to set up common preconditions for tests within a file (e.g., navigating to the page, clearing local storage).
- Prefer testing file uploads over camera interactions for scanning tests, as camera access can be inconsistent in test environments.
- Use snapshot testing (`toHaveScreenshot`) for verifying visual elements like the generated QR code. Remember to commit the baseline snapshot files located in the `tests/e2e/*.spec.ts-snapshots` directory.

**Debugging Failed Tests:**

- Playwright automatically generates an HTML report (`playwright-report/index.html`) after each run.
- For failed tests, the report includes:
  - Detailed error messages and stack traces.
  - Screenshots taken at the point of failure (configured in `playwright.config.ts`).
  - Trace files (`*.zip` in `test-results/`) which can be viewed with `pnpm exec playwright show-trace <trace-file.zip>` for a step-by-step replay.

**Limitations:**

- **Zip File Verification:** While tests verify that batch exports download a zip file, they do not automatically verify the _contents_ (e.g., number of images) of the zip file due to browser sandbox limitations. This requires manual inspection or a separate post-test script if full automation is needed.

## Adding new presets

An easy way to add a new preset is to create the QR code on the website first, and then save the config. The config JSON file will look something like this:

```json
{
  "props": {
    "data": "https://github.com/lyqht/mini-qr"
    // other props...
  },
  "style": {
    // other styles...
  }
}
```

Combine "style" with the value of "props" in a new json.

```ts
const yourNewPreset = {
  data: 'https://github.com/lyqht/mini-qr',
  // other props...
  style: {
    // other styles...
  }
}
```

Then add it to the `allPresets` array in `src/utils/presets.ts`. New presets should always be added as the last item in the array.

You will then see your new preset in the Presets dropdown in the website.

## Contributing Translations

### Getting Started with Crowdin

1. Follow [this documentation](https://support.crowdin.com/for-translators/#requesting-a-new-language) to create a free account on [Crowdin](https://crowdin.com)
2. Visit our [Mini QR Crowdin project](https://crowdin.com/project/miniqr)
3. Select the language you want to translate to
4. Start translating! No approval needed to begin

### Adding a New Language

If your language isn't available:

1. Open an issue requesting the new language
2. Wait for confirmation from @lyqht
3. Once added, you can begin translating

### Translation Status

You can check the current translation status on our [Crowdin project page](https://crowdin.com/project/mini-qr).

## License

By contributing to Mini QR, you agree that your contributions will be licensed under the GPL v3 license.

## Code of Conduct

Please refer to the [Code of Conduct](CODE_OF_CONDUCT.md) for more details.

## Final Note

The project maintainer, [@lyqht](https://github.com/lyqht), has the final say on whether a pull request will be merged. Please be patient and respectful throughout the review process.

Thank you for contributing to Mini QR! ✨
