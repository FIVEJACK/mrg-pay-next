FROM node:22-alpine

WORKDIR /app

ADD .next /app/.next
ADD public /app/public

COPY package.json /app
COPY yarn.lock /app
COPY next.config.ts /app

ARG port
ENV envPort=$port

# S3 / CDN — used by upload.sh and (optionally) by `next.config` for assetPrefix.
ARG S3_STATIC_CDN_URL
ENV S3_STATIC_CDN_URL=$S3_STATIC_CDN_URL
ARG S3_UPLOAD_FOLDER
ENV S3_UPLOAD_FOLDER=$S3_UPLOAD_FOLDER

# Partner API gateway base URL (SSR-only — read by src/config/config.ts).
ARG PARTNER_API_BASE_URL
ENV PARTNER_API_BASE_URL=$PARTNER_API_BASE_URL

# B2B2C hash secret (SSR-only — used to decode `hash_code` in
# src/lib/partner-api/b2b2c-hash.ts). Must never be exposed to the client.
ARG B2B2C_HASH_CODE
ENV B2B2C_HASH_CODE=$B2B2C_HASH_CODE

# PubNub client keys. Re-exported here so SSR pages can read them too if
# needed; the client bundle was already inlined by `next build`.
ARG NEXT_PUBLIC_PUBNUB_PUB_KEY
ENV NEXT_PUBLIC_PUBNUB_PUB_KEY=$NEXT_PUBLIC_PUBNUB_PUB_KEY
ARG NEXT_PUBLIC_PUBNUB_SUB_KEY
ENV NEXT_PUBLIC_PUBNUB_SUB_KEY=$NEXT_PUBLIC_PUBNUB_SUB_KEY

RUN yarn global add node-gyp
RUN --mount=type=cache,target=/root/.yarn-cache YARN_CACHE_FOLDER=/root/.yarn-cache yarn install --frozen-lockfile --production
RUN find . -name "*.map" -type f -delete

# Run application
EXPOSE $port
ENTRYPOINT PORT=${envPort} yarn run start
