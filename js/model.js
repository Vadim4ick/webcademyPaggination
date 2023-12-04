export class Model {
  constructor() {
    // Массив со всеми заявками
    this.data = [];
    // Лимит (Кол-во заявок получаемых с сервера)
    this.limit = 20;
    // Страница получаемая с сервера (По умолчанию мы получаем с 1-й страницы)
    this.page = 1;

    // Общее количество страниц (Нужно для пагинации, что бы расчитать максимальное число кнопок)
    // !!!! Это св-во можно вычислять АВТОМАТИЧЕСКИ (См. метод loadData, я закомментировал автоматическое вычисление)
    this.totalPages = 10;

    // Кол-во отображаемых страниц в кнопках (От 1 до 5 находясь на первой страницы).
    this.visibleBtns = 5;
    // Состояние isLoading для отображения скелетонов
    this.isLoading = false;
  }

  // Загрузка данных с небольшой задержкой
  async loadData(toggleLoader) {
    try {
      // Устанавливаем состояние загрузки в true
      this.isLoading = true;

      // Если вдруг мы передали toggleLoader, тогда:
      if (toggleLoader) {
        // Вызываем переданный toggleLoader в качестве callback, передавая внутрь результат состояния
        // isLoading, для того, что бы или отображать скелетоны, или не отображать. limit и visibleBtns
        // мы передаем для того, что бы понять, какое кол-во скелетонов отображать на странице)
        toggleLoader(this.isLoading, this.limit, this.visibleBtns);
      }

      // Делаем фетч передавая параметры лимита и страницы
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/comments?_limit=${this.limit}&_page=${this.page}`
      );

      // Обработка ошибок
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status}`);
      }

      // !!!!!!!!!!  МОЖНО РАСКОММЕНТИРОВАТЬ, тогда у нас автоматически будет вычисляться общее кол-во страниц!! !!!!!!!!!!!!!
      // // Получите заголовок с общим количеством записей
      // const totalCountHeader = res.headers.get("X-Total-Count");
      // const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;

      // // Рассчитываем общее количество страниц
      // this.totalPages = Math.ceil(totalCount / this.limit);
      // ==================================================================================================

      // Обработка результата
      const data = await res.json();

      // Задержка 500 миллисекунд (Для оценки работы скелетона)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Запись результата в this.data
      this.data = await data;

      // обновление URLSearchParams
      this.updateURL();

      // Плавный сброс скролла до нуля
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading data:", error.message);
    } finally {
      // Устанавливаем состояние загрузки в false
      this.isLoading = false;

      // Вызываем переданный toggleLoader в качестве callback, передавая внутрь результат состояния
      // isLoading, для того, что бы или отображать скелетоны, или не отображать
      if (toggleLoader) {
        toggleLoader(this.isLoading, this.limit, this.visibleBtns);
      }
    }
  }

  // Метод срабатывающий при клике на кнопку вперед
  async handleNextClick() {
    // Проверяем, если текущая страница меньше общего кол-ва страниц
    if (this.page < this.totalPages) {
      // Тогда увеличиваем на единицу page
      this.page++;

      // Вызываем загрузку данных снова, для того, что бы подгрузить страницы по текущему (Обновленному) page
      await this.loadData();
    }
  }

  // Метод срабатывающий при клике на кнопку назад
  async handlePrevClick() {
    // Если текущая страница больше 1
    if (this.page > 1) {
      // Тогда уменьшаем на единицу page
      this.page--;

      // Вызываем загрузку данных снова, для того, что бы подгрузить страницы по текущему (Обновленному) page
      await this.loadData();
    }
  }

  // Метод срабатывающий при клике на одну из кнопок пагинации. Принимаем текст кнопки
  async clickPage(selectedPage) {
    // Проверяем, если текст не равен NAN и не равен текущей странице, тогда:
    if (!isNaN(selectedPage) && selectedPage !== this.page) {
      // Перезаписываем содержимое текущей страницы на то, куда мы совершили клик
      this.page = selectedPage;

      // Вызываем загрузку данных снова, для того, что бы подгрузить страницы по текущему (Обновленному) page
      await this.loadData();
    }
  }

  // Ф-ция возвращающая параметры для отображения кнопок пагинации интервал (ОТ и ДО), а так же текущую страницу и общее кол-во страниц.
  getParams() {
    let startPage, endPage;

    if (this.totalPages <= this.visibleBtns) {
      // Если общее количество страниц меньше или равно видимому количеству кнопок,
      // показываем все страницы от 1 до totalPages
      startPage = 1;
      endPage = this.totalPages;
    } else {
      // В противном случае распределяем страницы относительно текущей страницы
      const halfVisibleBtns = Math.floor(this.visibleBtns / 2);

      // Начинаем от текущей страницы, учитывая половину видимых кнопок влево
      startPage = Math.max(1, this.page - halfVisibleBtns);

      // Заканчиваем на странице, которая находится на том же расстоянии вправо от текущей страницы
      endPage = startPage + this.visibleBtns - 1;

      // Если конечная страница выходит за пределы общего количества страниц, корректируем
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - this.visibleBtns + 1);
      }
    }

    return {
      startPage,
      endPage,
      page: this.page,
      totalPages: this.totalPages,
    };
  }

  // Функция для обновления URLSearchParams
  updateURL() {
    const urlParams = new URLSearchParams();

    // Добавление параметров фильтрации и сортировки
    urlParams.set("limit", this.limit);
    urlParams.set("page", this.page);

    // Обновление URL
    window.history.replaceState(null, null, "?" + urlParams.toString());
  }

  // Функция для обновления данных из URLSearchParams
  updateFromURL() {
    // Получение данных из URL ссылки
    const urlParams = new URLSearchParams(window.location.search);

    // Обновление параметров сортировки
    const limit = urlParams.get("limit") || this.limit;
    const page = urlParams.get("page") || this.page;

    // Подстановка данных полученных из URL в value селектов
    this.limit = parseInt(limit);
    this.page = parseInt(page);
  }
}
