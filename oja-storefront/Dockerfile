FROM node:22

WORKDIR /app

# Copy root workspace config + shared packages + storefront manifest
COPY package.json package-lock.json ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/data/package.json ./packages/data/
COPY packages/motion-design/package.json ./packages/motion-design/
COPY oja-storefront/package.json ./oja-storefront/
RUN npm ci && \
    R=$(node -p "require('./node_modules/rollup/package.json').version") && \
    E=$(node -p "require('./node_modules/esbuild/package.json').version") && \
    O=$(node -p "require('./node_modules/@tailwindcss/oxide/package.json').version") && \
    L=$(node -p "require('./node_modules/lightningcss/package.json').version") && \
    npm install --no-save "@rollup/rollup-linux-x64-gnu@$R" "@esbuild/linux-x64@$E" "@tailwindcss/oxide-linux-x64-gnu@$O" "lightningcss-linux-x64-gnu@$L"

# Copy source
COPY packages/ ./packages/
COPY oja-storefront/ ./oja-storefront/

EXPOSE 5174

CMD ["npm", "run", "dev", "--workspace=oja-storefront", "--", "--host", "0.0.0.0", "--port", "5174"]
