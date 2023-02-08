FROM node:16-alpine3.15 as build

WORKDIR /app

# Install dependencies npm
COPY package.json package-lock.json ./

RUN npm install -g moleculer-cli

ARG NPM_TOKEN
RUN echo "@aura-nw:registry=https://npm.pkg.github.com"  >> .npmrc
RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >> .npmrc
RUN npm install
RUN rm .npmrc
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

COPY --from=build /app/node_modules ./node_modules

# # Start server
CMD ["node", "./node_modules/moleculer/bin/moleculer-runner.js"]
