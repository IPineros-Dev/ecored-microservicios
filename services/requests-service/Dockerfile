FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8003

USER node
EXPOSE 8003

CMD ["node", "src/server.js"]