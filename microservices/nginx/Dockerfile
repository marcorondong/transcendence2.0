FROM nginx:1.26.2

COPY config/https-keys.sh /https-keys.sh
COPY config/includes/ /etc/nginx/includes/
RUN bash /https-keys.sh
# CMD ["nginx", "-g", "daemon off;"]
