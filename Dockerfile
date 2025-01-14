# Base stage - Install core dependencies (기본 단계 - 핵심 의존성 설치)
FROM node:21-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm install -g pnpm@9.14.4 turbo

# Pruning stage - Prepare project files (정리 단계 - 프로젝트 파일 준비)
FROM base AS pruner
ENV NODE_ENV=production
ENV NUXT_TELEMETRY_DISABLED=1
ENV DEBUG=nuxt:*
COPY . .
ENV TURBO_LOG_VERBOSITY=2
# Include packages/tsconfig content (packages/tsconfig 내용 포함)
RUN turbo prune "front-end" "tsconfig" --docker --out-dir=/app/out

# Install dependencies stage (의존성 설치 단계)
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build stage - Compile and prepare applications (빌드 단계 - 애플리케이션 컴파일 및 준비)
FROM base AS builder
ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}
ENV NUXT_TELEMETRY_DISABLED=1
ENV DEBUG=nuxt:*
# Increase Node.js heap memory limit (Node.js 힙 메모리 제한 증가)
ENV NODE_OPTIONS="--max-old-space-size=8192"
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .

# ============= Project Build Configuration =============
# ============= 프로젝트 빌드 설정 =============
# Front-end project (프론트엔드 프로젝트)
# 1. Copy environment file (환경 파일 복사)
COPY apps/front-end/.env.${BUILD_ENV} apps/front-end/.env
# 2. Install dependencies and build (의존성 설치 및 빌드)
RUN cd apps/front-end && \
  pnpm install --frozen-lockfile && \
  pnpm run build:${BUILD_ENV}

# Add new projects here following the pattern above:
# 위의 패턴을 따라 새로운 프로젝트를 여기에 추가하세요:
# 1. Copy project's env file (프로젝트의 env 파일 복사)
# 2. Install and build the project (프로젝트 설치 및 빌드)
# ====================================================

# Runner stage - Final production image (실행 단계 - 최종 프로덕션 이미지)
FROM base AS runner
ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}
ENV TZ Asia/Seoul

# Copy built artifacts (빌드된 결과물 복사)
COPY --from=builder /app/apps /app/apps
COPY --from=builder /app/apps/front-end/.env.${BUILD_ENV} /app/apps/front-end/.env

# ============= Port Configuration =============
# ============= 포트 설정 =============
# Front-end port (프론트엔드 포트)
EXPOSE 12000
# Add new project ports here (새로운 프로젝트 포트를 여기에 추가하세요)
# Example: EXPOSE <port_number> (예시: EXPOSE <포트_번호>)
# ==========================================

# ============= Project Execution =============
# ============= 프로젝트 실행 =============
# Single project execution (단일 프로젝트 실행)
CMD ["node", "apps/front-end/.output/server/index.mjs"]
# For multiple projects, use this format (여러 프로젝트 실행 시 다음 형식을 사용하세요):
# CMD ["sh", "-c", "node apps/front-end/.output/server/index.mjs & node apps/project2/.output/server/index.mjs"]
# ==========================================