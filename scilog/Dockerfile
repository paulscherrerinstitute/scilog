FROM node:20-alpine AS builder

WORKDIR /frontend
COPY package*.json /frontend/
RUN npm install
COPY . /frontend/
RUN npx ng build --output-path=dist

FROM nginx:1.21-alpine
RUN rm -rf /usr/share/nginx/html*
COPY --from=builder /frontend/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
