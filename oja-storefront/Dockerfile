FROM node:22

WORKDIR /app

# Copy root workspace config + shared packages + storefront manifest
COPY package.json package-lock.json ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/data/package.json ./packages/data/
COPY packages/motion-design/package.json ./packages/motion-design/
COPY oja-storefront/package.json ./oja-storefront/
RUN npm install

# Copy source
COPY packages/ ./packages/
COPY oja-storefront/ ./oja-storefront/

EXPOSE 5174

CMD ["npm", "run", "dev", "--workspace=oja-storefront", "--", "--host", "0.0.0.0", "--port", "5174"]
