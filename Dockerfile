FROM node:16-alpine3.15 as build

WORKDIR /app

# Install dependencies npm
COPY package.json package-lock.json ./

RUN npm install -g moleculer-cli

RUN npm ci --omit=dev

# Copy source
COPY . .

# Build and cleanup
# ENV NODE_ENV=production

# Generate prisma
RUN npm run graphql:generate

# build
RUN npm run build && npm prune

# -------------------
FROM node:16-alpine3.15

WORKDIR /app

# Copy built files
COPY . .
COPY --from=build /app/dist/ .
COPY --from=build /app/prisma ./prisma/

RUN echo $(ls -1 /app)

RUN npm ci --omit=dev

# # Start server
CMD ["node", "./node_modules/moleculer/bin/moleculer-runner.js"]
