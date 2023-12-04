export class View {
  elements = {
    commentsContainer: document.querySelector(".comments-container"),
    paginationContainer: document.querySelector(".pagination .pages"),
    btnPrev: document.getElementById("prevPage"),
    btnNext: document.getElementById("nextPage"),
    containerSkeleton: document.querySelector(".skeletons"),
  };

  // Метод рендера комментов
  renderComments(comments) {
    // Очистка контейнера
    this.elements.commentsContainer.innerHTML = "";

    // Перебор комментов
    comments.forEach((comment) => {
      // Формирование шаблонной строчки
      const commentTemplate = `
            <article class="comment">
              <h2>${comment.name}</h2>
              <span>${comment.email}</span>
              <p>${comment.body}</p>
            </article>
          `;

      // Вставка в контейнер содержимого
      this.elements.commentsContainer.insertAdjacentHTML(
        "afterbegin",
        commentTemplate
      );
    });
  }

  // Ф-ция для рендера на страницу пагинации
  renderPagination(params) {
    const { startPage, endPage, page, totalPages } = params;

    // очищаем контейнер кнопок
    this.elements.paginationContainer.innerHTML = "";

    // Перебираем кнопки со стартовой позиции до конечной (Принемаемых в качестве аргументов, передаваемых из модели)
    for (let i = startPage; i <= endPage; i++) {
      // Формируем шаблонную строчку для кнопки пагинации
      const markup = `
            <button class="pagination-btn ${
              i === page ? "active" : ""
            }">${i}</button>
        `;

      // Вставляем ее в контейнер
      this.elements.paginationContainer.insertAdjacentHTML("beforeend", markup);
    }

    // ! ЭТО МОЖНО ВЫНЕСТИ В ОТДЕЛЬНЫЙ МЕТОД !

    // Если мы находимся на первой странице, то блокируем кнопку "Назад"
    if (page === 1) {
      this.elements.btnPrev.disabled = true;
    } else {
      this.elements.btnPrev.disabled = false;
    }

    // Если мы находимся на последней странице, то блокируем кнопку "Вперед"
    if (page === totalPages) {
      this.elements.btnNext.disabled = true;
    } else {
      this.elements.btnNext.disabled = false;
    }
  }

  // Метод для отображения скелетонов, принимающий в себя isLoading, limitComments и limitBtns
  toggleSkeleton(isLoading, limitComments, limitBtns) {
    // Если isLoading = true, тогда:
    if (isLoading) {
      // Мы создаем массив из того кол-ва элементов, которые мы принимаем, заполняем массив нулями
      // P.S. можно заполнять хоть чем, нам это никакой роли не играет. После чего перебираем массив
      // и рендерим разметку под скелетон КОММЕНТА. limitComments - кол-во скелетонов для комментов
      new Array(limitComments).fill(0).forEach(() => {
        const markup = `
        <div class="skeleton comment">      
            <h2 class="loader-title"></h2>
            <p class="loader-text"></p>
        </div>
        `;

        this.elements.containerSkeleton.insertAdjacentHTML(
          "afterbegin",
          markup
        );
      });

      // Мы создаем массив из того кол-ва элементов, которые мы принимаем, заполняем массив нулями
      // P.S. можно заполнять хоть чем, нам это никакой роли не играет. После чего перебираем массив
      // и рендерим разметку под скелетон КНОПКИ ПАГИНАЦИИ. limitBtns - кол-во скелетонов для кнопок
      new Array(limitBtns).fill(0).forEach(() => {
        const markup = `<button class="skeleton pagination-btn"></button>`;

        this.elements.paginationContainer.insertAdjacentHTML(
          "afterbegin",
          markup
        );
      });
    } else {
      // Иначе, если isLoading = false мы очищаем наш контейнер со скелетонами
      this.elements.containerSkeleton.innerHTML = "";
    }
  }

  // Disable кнопок
  disableButtons() {
    // Disable кнопки назад
    this.elements.btnPrev.disabled = true;
    // Disable кнопки вперед
    this.elements.btnNext.disabled = true;

    // Перебор всех кнопок пагинации и их блокировка
    this.elements.paginationContainer
      .querySelectorAll("button")
      .forEach((btn) => {
        btn.disabled = true;
      });
  }

  // Enable кнопок
  enableButtons() {
    // Enable кнопки назад
    this.elements.btnPrev.disabled = false;
    // Enable кнопки вперед
    this.elements.btnNext.disabled = false;

    // Перебор всех кнопок пагинации и их Enable
    this.elements.paginationContainer
      .querySelectorAll("button")
      .forEach((btn) => {
        btn.disabled = false;
      });
  }
}
