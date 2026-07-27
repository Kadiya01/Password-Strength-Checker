# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src/

RUN npx prisma generate

RUN npm install -g tsc-alias && \
    npm run build && \
    tsc-alias -p tsconfig.build.json && \
    echo "Build complete: TypeScript compiled with path alias resolution"

# Stage 2: Production
FROM node:20-alpine AS production

RUN apk add --no-cache tini

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

USER appuser

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
