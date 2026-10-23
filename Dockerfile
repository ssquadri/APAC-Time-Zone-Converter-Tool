
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY timezone.js /usr/share/nginx/html/timezone.js

EXPOSE 80
