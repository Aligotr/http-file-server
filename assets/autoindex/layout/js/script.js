const idAutoindexTable = "table#list"
const currentPathURL = window.location.pathname

// Перенос текста заголовка в шапку
// Появление текущего пути зависит от опции в Nginx: fancyindex_show_path = on
function breadcrumb() {
  const textNodes = $("#wrapper-table-list")
    .contents()
    .filter(function () {
      return this.nodeType == 3 // Node.TEXT_NODE
    })
  const combinedText = textNodes.text()
  textNodes.remove()
  const currentPath = $.trim(combinedText)
  const homeIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" class="bi bi-house-fill" viewBox="0 2 16 16"> <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/> <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/> </svg>'

  const segments = currentPath.split("/")

  const currentURL = window.location.href
  const query = currentURL.substring(currentURL.lastIndexOf("/") + 1)
  const queryCheck = query.startsWith("?")

  let segmentsURL = ""

  const breadcrumb = segments.map(function (segment, index) {
    segmentsURL += segment + "/"

    // Получение параметров запроса страницы
    let resultURL = segmentsURL
    let resultURLHome = "/"
    if (queryCheck) {
      resultURL = segmentsURL + query
      resultURLHome += query
    }

    // Если это первый сегмент (который всегда пустой из-за начального '/'), заменяем его на иконку дома
    if (index === 0) {
      return '<a href="' + resultURLHome + '" >' + homeIconSvg + "</a>"
    }
    // Если это последний сегмент или предпоследний (который всегда пустой из-за конечного '/'), делаем его просто текстом
    if (index === segments.length - 1 || index === segments.length - 2) {
      return "<span>" + segment + "</span>"
    }

    // Иначе делаем его ссылкой
    return '<a href="' + resultURL + '">' + segment + "</a>"
  })

  $("#breadcrumb").html(breadcrumb.join("/"))
}

// Замена имён ссылок в таблице на полные
function fullLinksTableList(rowTableList) {
  $(rowTableList + " td.link a").each(function () {
    const linkArray = $(this)
    const linkHrefURIArray = linkArray.attr("href")
    const linkHrefArray = decodeURI(linkHrefURIArray)
    const linkTextArray = linkArray.text()

    if (linkTextArray.endsWith("..>")) {
      linkArray.text(linkHrefArray)
    }
  })
}

// Замена названий размеров файлов и папок
function friendlyNameSize(rowTableList) {
  const sizeName = {
    B: "Б",
    KiB: "Кб",
    MiB: "Мб",
    GiB: "Гб",
    TiB: "Тб",
  }

  $(rowTableList + " td.size").each(function () {
    const text = $(this).text().split(" ")
    const key = text[text.length - 1]
    if (sizeName[key]) {
      text[text.length - 1] = sizeName[key]
      $(this).text(text.join(" "))
    }
  })
}

// Замена названия ссылки перехода к родительской папке
// Появление зависит от опции в Nginx: fancyindex_hide_parent_dir off
function nameParentDirLink(presentParentDirLink, firstRowTableList) {
  if (presentParentDirLink) {
    if (currentPathURL != "/") {
      firstRowTableList.text("../")
    }
  }
}

// Замена заголовков таблицы
function headerTable() {
  let nameIconSorting = "↓"
  let sizeIconSorting = "↓"
  let dateIconSorting = "↓"

  let nameURLSorting = "?C=N&O=D"
  let sizeURLSorting = "?C=S&O=D"
  let dateURLSorting = "?C=M&O=D"
  const currentUrl = window.location.href

  if (currentUrl.endsWith("/?C=N&O=D")) {
    nameIconSorting = "↑"
    nameURLSorting = "./"
  }
  if (currentUrl.endsWith("/?C=S&O=D")) {
    sizeIconSorting = "↑"
    sizeURLSorting = "./"
  }
  if (currentUrl.endsWith("/?C=M&O=D")) {
    dateIconSorting = "↑"
    dateURLSorting = "./"
  }

  $(idAutoindexTable + " thead").html(
    '<tr> \
      <th  class="name-header-table-list"> \
        <span>Имя</span> \
        <a href="' +
      nameURLSorting +
      '">' +
      nameIconSorting +
      '</a> \
      </th> \
      <th class="size-header-table-list"> \
        <span>Размер</span> \
        <a href="' +
      sizeURLSorting +
      '">' +
      sizeIconSorting +
      '</a> \
      </th> \
      <th class="date-header-table-list"> \
        <span>Дата</span> \
        <a href="' +
      dateURLSorting +
      '">' +
      dateIconSorting +
      "</a> \
      </th> \
    </tr>"
  )
}

// Поиск
function search(rowTableList) {
  $("#search-form").on("input", function () {
    const target = $("#searchBox").val()
    filter(target)
  })

  function filter(target) {
    $(rowTableList).each(function () {
      const rowArray = $(this)
      const linkArray = $(this).find("td.link a").text()
      const searchArray = decodeURI(linkArray).toLowerCase()
      if (searchArray.indexOf(target.toLowerCase()) > -1) {
        rowArray.show()
      } else {
        rowArray.hide()
      }
    })
  }
}

// Кнопка "Наверх"
function btnUp() {
  const btnTop = document.getElementById("btn-up")
  window.onscroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      btnTop.style.display = "block"
    } else {
      btnTop.style.display = "none"
    }
  }
  btnTop.addEventListener("click", function () {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  })
}

// Удалить строку таблицы
function removeElement(rowTableList, target) {
  $(rowTableList).each(function () {
    const rowArray = $(this)
    const linkArray = $(this).find("td.link a").text()
    const searchArray = decodeURI(linkArray).toLowerCase()
    if (searchArray.indexOf(target.toLowerCase()) > -1) {
      rowArray.remove()
    }
  })
}

//
document.addEventListener("DOMContentLoaded", () => {
  // Проверка наличия ссылки на родительскую папку в первой строке таблицы
  const parentDirTitle = "Parent directory/"
  const firstRowTableList = $(idAutoindexTable + " tbody tr:first-child td.link a")
  const presentParentDirLink = firstRowTableList.text() === parentDirTitle ? true : false
  const rowTableList = presentParentDirLink
    ? idAutoindexTable + " tbody tr:not(:first-child)"
    : idAutoindexTable + " tbody tr"

  // Удалить строку таблицы, содержащую ссылку с искомой фразой
  removeElement(rowTableList, "#Hidden/")

  // Перенос текста заголовка в шапку
  breadcrumb()

  // Замена имён ссылок в таблице на полные
  fullLinksTableList(rowTableList)

  // Замена названий размеров файлов и папок
  friendlyNameSize(rowTableList)

  // Замена названия ссылки перехода к родительской папке
  nameParentDirLink(presentParentDirLink, firstRowTableList)

  // Замена заголовков таблицы
  headerTable()

  // Сделать видимой таблицу и подвал
  // По умолчанию "display:none" в основном файле стилей
  // Проблема: При загрузке страницы происходит мерцание элементов, скрипту нужно время чтобы изменить DOM
  // Решение: Скрыть заменяемые элементы при загрузке страницы и отобразить после изменения
  // Замечание: Подвал хоть и не редактируется, но находится под таблице. В результате скрытия таблицы, подвал прыгает наверх. Чтобы избежать этого эффекта было решено скрыть не только таблицу, но и подвал
  $("#autoindex, #footer").show()

  // Поиск
  search(rowTableList)

  // Кнопка "Наверх"
  // Только на указанных устройствах
  if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    btnUp()
  }
})
