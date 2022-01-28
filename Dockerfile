FROM node:14.16.1 AS base

WORKDIR /app

# copy package.json package-lock.json and install npm dependicies
COPY package*.json .babelrc ./
RUN npm install

# copy the source files
COPY . .

# build bundle
RUN npm run build

# Remove dev dependencies
RUN npm prune --production
#######################################################################

FROM base AS release
LABEL maintainer="kareem.mohllal@gmail.com"

# set some enviroment variables
ENV NODE_OPTIONS=--max-old-space-size=4096

# copy the build directory and node_modules
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --chown=node:node --from=base /app/dist ./dist

# change the root user for more security
USER node

# run the app
CMD [ "npm", "run", "serve" ]