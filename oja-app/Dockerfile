FROM node:22

WORKDIR /app

# Copy root workspace config + shared packages + app manifest
COPY package.json package-lock.json ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/data/package.json ./packages/data/
COPY packages/motion-design/package.json ./packages/motion-design/
COPY oja-app/package.json ./oja-app/
RUN npm install

# Copy source
COPY packages/ ./packages/
COPY oja-app/ ./oja-app/

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace=oja-app", "--", "--host", "0.0.0.0", "--port", "5173"]
