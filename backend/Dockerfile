FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# No build script needed for pure Prisma backend
# RUN npm run build

EXPOSE 5555

CMD ["npx", "prisma", "studio"]
