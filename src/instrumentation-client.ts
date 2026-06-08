/**
 * Client-side instrumentation entry point.
 *
 * Next.js runs this after the document loads but before React hydration, which
 * makes it the right place to bring up analytics so early events aren't lost.
 * See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation-client.md`.
 */

import { initAmplitude } from "@/lib/amplitude";

initAmplitude();
