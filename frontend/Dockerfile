FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

CMD ["npx", "serve", "dist", "-l", "tcp://0.0.0.0:${PORT:-3000}"]
