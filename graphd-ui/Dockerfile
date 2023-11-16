####
#### Build image (multi-stage)
####
FROM node:14 AS build

WORKDIR /app

# The minimum we need to install dependencies
COPY package*.json ./

## Installing dependencies without trying to update it
RUN npm ci

# Copying the source code from host to this image
COPY . .

# Building with webpack
RUN npm run build

# Set GCP service account env variable
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/service-account.json"

####
#### Our server image
####
FROM nginx:stable-alpine

# Copying everything we need.
COPY --from=build /app/build /usr/share/nginx/html

# default port 80 (HTTP) -- an proxy would do the https part in prod.
EXPOSE 80

# Non root user -- for security reasons.
RUN  chown -R nginx:nginx /var/cache/nginx && \
     chown -R nginx:nginx /var/log/nginx && \
     chown -R nginx:nginx /etc/nginx/conf.d && \
     touch /var/run/nginx.pid && \
     chown -R nginx:nginx /var/run/nginx.pid
USER nginx

# Daemon off => avoids unexpected container death
#               (caused by spawn subprocesses that may replace the main nginx process)
CMD ["nginx", "-g", "daemon off;"]
