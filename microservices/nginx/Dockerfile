FROM nginx:1.26.2

RUN mkdir -p /usr/share/nginx/html/uploads/users/default/

COPY src/avatar_placeholder.jpg /usr/share/nginx/html/uploads/users/default/picture.jpg

COPY config/https-keys.sh /https-keys.sh
COPY config/includes/ /etc/nginx/includes/
RUN bash /https-keys.sh
# CMD ["nginx", "-g", "daemon off;"]
