# HTTP-File-Server

## Описание

HTTP-File-Server - Редизайн для Nginx Fancy Index (autoindex).

Цель проекта заключается в том, что бы сделать доступными файлы и папки по HTTP-протоколу, используя минимум серверных ресурсов.

Проект использует: Nginx, Fancy Index, JQuery, Bootstrap, Docker.

- Nginx - индексирует папки для отображения в браузере;
- Fancy Index - расширяет возможности индексации, изменяя блоки выведения информации;
- JQuery и Bootstrap - помогают настроить отображение элементов на странице;
- Docker - подготавливает проект для быстрого развёртывания и использования.

## Установка

- Собрать docker-образ: `./app.sh`;
- Развернуть контейнер с помощью docker, примонтировать публикуемую папку к папке контейнера `/srv/app/public`.
- Проверить работоспособность: `http://localhost:8080`.
- Донастроить контейнер под свои задачи.

`docker-compose.yml`

```
services:
  http-file-server:
    # Безопасность
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp:rw,noexec,nosuid
    # Настройки контейнера
    container_name: http-file-server
    image: aligotr/http-file-server:latest
    restart: unless-stopped
    ports:
      - 8080:8080
    # volumes:
    #   - /srv/http-file-server/:/srv/app/public/:ro
    # environment:
    #   BASE_URL: files.local
```
