# Base stage
FROM node:21-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
# RUN pnpm global add turbo
RUN npm install -g pnpm turbo

# Pruning stage
FROM base AS pruner
ENV NODE_ENV=production
ENV NUXT_TELEMETRY_DISABLED=1
ENV DEBUG=nuxt:*
COPY . .
ENV TURBO_LOG_VERBOSITY=2
# packages/tsconfig의 내용도 포함되도록 수정
# RUN turbo prune front-end --docker --out-dir=/app/out
RUN turbo prune "front-end" "tsconfig" --docker --out-dir=/app/out

# Install dependencies
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the app
FROM base AS builder
ARG BUILD_ENV=production
ENV NODE_ENV=production
ENV NUXT_TELEMETRY_DISABLED=1
ENV DEBUG=nuxt:*
# Node.js 힙 메모리 제한 증가
ENV NODE_OPTIONS="--max-old-space-size=8192"
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
# env 파일 카피
COPY apps/front-end/.env.${BUILD_ENV} apps/front-end/.env
# Nuxt 빌드 전에 의존성이 모두 설치되어 있는지 확인
RUN cd apps/front-end && \
  pnpm install && \
  pnpm run build:${BUILD_ENV}

# FROM node:21-alpine AS runner
FROM base AS runner
ENV NODE_ENV production
ENV TZ Asia/Seoul

# Copy built artifacts from all projects except front-design
COPY --from=builder /app/apps /app/apps

EXPOSE 12000

# Assuming front-end is the main application to run
# ***** 프로젝트를 추가할 때 CMD 해당 프로젝트를 추가 하는 방법 ******
# CMD ["sh", "-c", "node apps/front-end/.output/server/index.mjs & node apps/front-end2/.output/server/index.mjs"]
# ********************************************************
CMD ["node", "apps/front-end/.output/server/index.mjs"]