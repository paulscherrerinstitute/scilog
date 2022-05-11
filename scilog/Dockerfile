FROM node:16-alpine AS builder

WORKDIR /frontend
COPY package*.json /frontend/
RUN npm install
COPY . /frontend/
RUN npx ng build

FROM nginx:1.21-alpine
RUN rm -rf /usr/share/nginx/html*
COPY --from=builder /frontend/dist/ /usr/share/nginx/html/
EXPOSE 80
