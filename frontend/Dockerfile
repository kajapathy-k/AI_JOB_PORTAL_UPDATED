FROM node:20-alpine

WORKDIR /app

RUN apk upgrade --no-cache

COPY package.json package-lock.json ./
RUN npm ci \
    && npm cache clean --force \
    && rm -rf /root/.npm /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY . .

EXPOSE 5173

CMD ["./node_modules/.bin/vite", "--host"]
