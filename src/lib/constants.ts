export const APPLY_FOR_RIGHTS_URL = 'https://forms.gle/NJfNUHBLG73Wbjdz7';

export const ERROR_MESSAGES = {
  INTERNAL: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not found',
  INVALID_JSON: 'Invalid JSON',
} as const;

export const ALLOWED_UPLOAD_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

export const UPLOAD_ERRORS = {
  WRONG_TYPE: 'Only JPG, PNG, and WEBP files are allowed',
  TOO_LARGE: `File must be under ${MAX_UPLOAD_MB}MB`,
} as const;

export const VALID_CATEGORIES: readonly string[] = [
  'Drama',
  'Comedy',
  'Historical Drama',
  "Children's Play",
  'Political Satire',
  'Thriller',
  'SciFi/Fantasy',
  'Radio Play',
  'One Act Play',
  'Screenplay',
  'Comedy/Drama',
  'Theater for Youth',
  'Collection',
];
