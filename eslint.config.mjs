import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

// Forbidden Tailwind classes: physical inline-axis utilities. The whole site
// is RTL/LTR mirrored via logical properties, so only ms-/me-/ps-/pe-/start-/
// end- are allowed (plan §9, §17). Matches optional variant prefixes (sm:, etc).
const physicalClass = String.raw`(?:^|\s|:)(?:ml|mr|pl|pr|left|right)-`;
const physicalMsg =
  'Use logical properties (ms-/me-/ps-/pe-/start-/end-), not physical ones (ml-/mr-/pl-/pr-/left-/right-). The site must mirror cleanly in RTL.';

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Ban hardcoded physical-direction Tailwind utilities in JSX strings.
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=/${physicalClass}/]`,
          message: physicalMsg,
        },
        {
          selector: `TemplateElement[value.cooked=/${physicalClass}/]`,
          message: physicalMsg,
        },
      ],
      // No `any` (CLAUDE.md).
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'scripts/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
