##############################################################
##########     Сборка вспомогательных элементов     ##########
##############################################################
FROM nginx:alpine-slim AS Builder

# Установка исходного кода Nginx и модулей
RUN \
  echo "--- Установка зависимостей и дополнительных программ ---"; \
    apk add --no-cache \
      gcc \
      libc-dev \
      make \
      openssl-dev \
      pcre-dev \
      zlib-dev \
      linux-headers \
      curl \
      gnupg \
      libxslt-dev \
      gd-dev \
      geoip-dev \
      jq; \
  echo "--- Очистка системы ---"; \
    rm -rf \
      /tmp/*; \
  echo "--- NGINX ---"; \
    NGINX_VERSION=`nginx -v 2>&1 | grep -o 'nginx/[^ ]*' | sed 's|nginx/||'`; \
    mkdir -p /usr/src; \
    wget "http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz" -O nginx.tar.gz; \
    tar -zxC /usr/src -f nginx.tar.gz; \
  echo "--- NGINX - Fancy Index ---"; \
    #wget "https://github.com/aperezdc/ngx-fancyindex/releases/download/v0.5.2/ngx-fancyindex-0.5.2.tar.xz" -O fancyindex.tar.xz; \
    FANCYINDEX_VERSION=`curl -s "https://api.github.com/repos/aperezdc/ngx-fancyindex/releases/latest" | jq -r '.tag_name | sub("^v";"")'`; \
    wget "https://github.com/aperezdc/ngx-fancyindex/releases/download/v${FANCYINDEX_VERSION}/ngx-fancyindex-${FANCYINDEX_VERSION}.tar.xz" -O fancyindex.tar.xz; \
    tar -xC /usr/src -f fancyindex.tar.xz

# Компиляция и установка Nginx с модулями
RUN \
  cd /usr/src/nginx-*; \
  ./configure --with-compat --add-dynamic-module=../ngx-fancyindex-*; \
  make && make install

##############################################################
##########         Сборка основного образа          ##########
##############################################################

FROM nginxinc/nginx-unprivileged:alpine-slim

# Метки
ARG PROJECT_NAME="empty"
LABEL project-name=$PROJECT_NAME
LABEL maintainer="Aligotr"

# Переменные
ENV \
  TZ="Europe/Moscow" \
  HOME="/srv/app"
WORKDIR $HOME

##########      Настройка основного приложения      ##########
#
USER root

COPY --from=Builder /usr/local/nginx/modules /etc/nginx/modules/

RUN \
  echo "--- Установка зависимостей и дополнительных программ ---"; \
  apk add --no-cache \
    tzdata \
    nano; \
  echo "--- Очистка системы ---"; \
  rm -rf \
    /tmp/*; \
  echo "--- Установка элементов из вспомогательного образа' ---"; \
    sed '/events {/i\# Modules\nload_module \/etc\/nginx\/modules\/ngx_http_fancyindex_module.so;\n' -i /etc/nginx/nginx.conf

COPY --chown=101:0 ./assets/default.conf.template /etc/nginx/templates/
COPY --chown=101:0 ./assets/autoindex /srv/app

# Разрешить доступ используя любое целевое имя домена или ip-адрес
# Рекомендуется заменить при разворачивании контейнера
ENV BASE_URL='~. ""'

USER nginx

##########   Настройка и запуск основного процесса   #########
#
CMD ["nginx", "-g", "daemon off;"]
