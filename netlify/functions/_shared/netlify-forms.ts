import { resolveSiteUrl } from './site-url';

// Submits to Netlify's native Forms endpoint the same way the browser does for the existing
// contact form (see src/services/api/contactForm.ts): a urlencoded POST with a `form-name`
// field, to the site root. The form must also exist as a hidden static <form> in index.html so
// Netlify's build-time bot registers its field schema.
export const submitToNetlifyForms = async (
  formName: string,
  fields: Record<string, string>
): Promise<void> => {
  const body = new URLSearchParams({ 'form-name': formName, ...fields }).toString();

  const response = await fetch(resolveSiteUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Netlify Forms submission for "${formName}" failed with status ${response.status}`
    );
  }
};
