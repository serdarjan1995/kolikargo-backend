FROM node:16-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./


FROM base AS development

RUN yarn install --production=false
COPY . .
CMD ["yarn", "start", "--watch"]


### PROD Environment  ###
FROM base as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN yarn install --production=true
COPY . .
RUN npm run build
CMD ["node", "dist/main"]
