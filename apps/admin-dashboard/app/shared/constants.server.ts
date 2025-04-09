import { z } from 'zod';

import { Environment } from '@oyster/core/admin-dashboard/ui';

// Validation for required non-empty strings
const EnvironmentVariable = z.string().trim().min(1);

// Validation for optional fields (can be undefined or empty strings)
const OptionalEnvironmentVariable = z
  .string()
  .transform((val) => (val === '' ? undefined : val))
  .optional();

const BaseEnvironmentConfig = z.object({
  ADMIN_DASHBOARD_URL: EnvironmentVariable,
  AIRTABLE_API_KEY: EnvironmentVariable,
  AIRTABLE_FAMILY_BASE_ID: EnvironmentVariable,
  AIRTABLE_MEMBERS_TABLE_ID: EnvironmentVariable,
  AIRTABLE_RESUME_BOOKS_BASE_ID: EnvironmentVariable,
  API_URL: EnvironmentVariable,
  DATABASE_URL: EnvironmentVariable,
  ENVIRONMENT: z.nativeEnum(Environment),
  GITHUB_TOKEN: EnvironmentVariable,
  GOOGLE_CLIENT_ID: EnvironmentVariable,
  GOOGLE_CLIENT_SECRET: EnvironmentVariable,
  GOOGLE_DRIVE_RESUME_BOOKS_FOLDER_ID: EnvironmentVariable,
  JWT_SECRET: EnvironmentVariable,
  MEMBER_PROFILE_URL: EnvironmentVariable,
  REDIS_URL: EnvironmentVariable,
  SENTRY_DSN: EnvironmentVariable,
  SESSION_SECRET: EnvironmentVariable,
});

const EnvironmentConfig = z.discriminatedUnion('ENVIRONMENT', [
  // Development mode
  z
    .object({
      // Required fields
      ADMIN_DASHBOARD_URL: EnvironmentVariable,
      API_URL: EnvironmentVariable,
      DATABASE_URL: EnvironmentVariable,
      ENVIRONMENT: z.literal(Environment.DEVELOPMENT),
      JWT_SECRET: EnvironmentVariable,
      REDIS_URL: EnvironmentVariable,
      SESSION_SECRET: EnvironmentVariable,
      // Optional fields (can be empty strings)
      AIRTABLE_API_KEY: OptionalEnvironmentVariable,
      AIRTABLE_FAMILY_BASE_ID: OptionalEnvironmentVariable,
      AIRTABLE_MEMBERS_TABLE_ID: OptionalEnvironmentVariable,
      AIRTABLE_RESUME_BOOKS_BASE_ID: OptionalEnvironmentVariable,
      GITHUB_TOKEN: OptionalEnvironmentVariable,
      GOOGLE_CLIENT_ID: OptionalEnvironmentVariable,
      GOOGLE_CLIENT_SECRET: OptionalEnvironmentVariable,
      GOOGLE_DRIVE_RESUME_BOOKS_FOLDER_ID: OptionalEnvironmentVariable,
      MEMBER_PROFILE_URL: OptionalEnvironmentVariable,
      SENTRY_DSN: OptionalEnvironmentVariable,
      SMTP_HOST: OptionalEnvironmentVariable,
      SMTP_PASSWORD: OptionalEnvironmentVariable,
      SMTP_USERNAME: OptionalEnvironmentVariable,
    })
    .refine(
      (data) => {
        // Ensure optional fields are either undefined or non-empty if provided
        const optionalFields = [
          'AIRTABLE_API_KEY',
          'AIRTABLE_FAMILY_BASE_ID',
          'AIRTABLE_MEMBERS_TABLE_ID',
          'AIRTABLE_RESUME_BOOKS_BASE_ID',
          'GITHUB_TOKEN',
          'GOOGLE_CLIENT_ID',
          'GOOGLE_CLIENT_SECRET',
          'GOOGLE_DRIVE_RESUME_BOOKS_FOLDER_ID',
          'MEMBER_PROFILE_URL',
          'SENTRY_DSN',
          'SMTP_HOST',
          'SMTP_PASSWORD',
          'SMTP_USERNAME',
        ];
        return optionalFields.every(
          (field) => data[field] === undefined || data[field].length >= 1
        );
      },
      {
        message: 'Optional fields must be non-empty if provided',
      }
    ),
  // Production mode
  BaseEnvironmentConfig.extend({
    ENVIRONMENT: z.literal(Environment.PRODUCTION),
    POSTMARK_API_TOKEN: EnvironmentVariable,
  }),
]);

export const ENV = EnvironmentConfig.parse(process.env);
