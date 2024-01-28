#!/usr/bin/env sh
set -eu

# Переменные
DEVELOPER=aligotr
PROJECT_NAME=http-file-server
CONTAINER_ID=""
get_container_id() {
  CONTAINER_ID=$(docker ps --all --quiet --filter "label=project-name=$PROJECT_NAME")
}

# Помощь
help() {
  cat <<EOF
────────────────────────────────────
                             O o
                                o
 ______   ______   ______  [O]__ST
|""""""|_|""""""|_|""""""|_|======}
'-0--0-'"'-0--0-'"'-0--0-'"'000--o\.
────────────────────────────────────
Проект: $PROJECT_NAME
Тип: docker
────────────────────────────────────
Сборка образа: build
Вывести логи образа: logs
Подключиться к контейнеру: exec
Удалить контейнер: rm
Очистить систему от лишних docker-объектов: clean
Удалить контейнер, его образ, тома, сеть и слои сборки: remove
────────────────────────────────────
EOF
}

# Функции
build() {
  docker build -t ${DEVELOPER}/${PROJECT_NAME}:latest --build-arg PROJECT_NAME=${PROJECT_NAME} ./
}

logs() {
  get_container_id
  if [ ! -z ${CONTAINER_ID} ]; then
    docker logs ${CONTAINER_ID} --follow --tail 50
  else
    echo "Контейнер не найден"
  fi
}

exec_sh() {
  get_container_id
  if [ ! -z ${CONTAINER_ID} ]; then
    docker exec -it ${PROJECT_NAME} sh
  else
    echo "Контейнер не найден"
  fi
}

rm() {
  get_container_id
  if [ ! -z ${CONTAINER_ID} ]; then
    echo -n "Контейнер остановлен: " && docker stop ${CONTAINER_ID}
    echo -n "Контейнер удалён: " && docker rm ${CONTAINER_ID} --force
  else
    echo "Контейнер не найден"
  fi
}

clean() {
  echo "ВНИМАНИЕ! Команда очистит все не используемые docker-объекты"
  prompt
  docker image prune --all --force
  docker system prune --volumes --force
}

remove() {
  echo "ВНИМАНИЕ! Команда удалит контейнер, его образ, тома, сеть и слои сборки"
  prompt
  IMAGE_ID=$(docker images --quiet --filter="reference=${DEVELOPER}/${PROJECT_NAME}:latest")
  if [ ! -z $IMAGE_ID ]; then
    rm
    echo -n "Образ удалён: " && docker rmi ${DEVELOPER}/${PROJECT_NAME}:latest --force
    docker system prune --volumes --force
  else
    echo "Образ не найден"
  fi
}

# Утилиты
default() {
  build
}

prompt() {
  read -p "Продолжить выполнение? [y/n] " choice
  case $choice in
  [Yy]*)
    break
    ;;
  *) exit ;;
  esac
}

# Сопоставление: Аргумент-Функция
if [ $# -eq 0 ]; then
  default
else
  for arg in "$@"; do
    case $arg in
    "build")
      build
      ;;
    "logs")
      logs
      ;;
    "exec")
      exec_sh
      ;;
    "rm")
      rm
      ;;
    "clean")
      clean
      ;;
    "remove")
      clean
      ;;
    "help")
      help
      ;;
    *)
      echo "────────────────────────────────────"
      echo "Неизвестный аргумент: $arg"
      help
      ;;
    esac
  done
fi
