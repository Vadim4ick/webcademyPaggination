import { Model } from "./model.js";
import { View } from "./view.js";

// Инициализация модели
const model = new Model();

// Инициализация view
const view = new View();

// Функция для обновления данных из URLSearchParams (Достать содержимое URL ссылки и обновить в constructor модели)
model.updateFromURL();

// Делаем запрос на сервер для получения заявок
await model.loadData(toggleSkeleton);

// Рендерим все комменты после ожидания ответа от сервера выше (Запуска loadData)
view.renderComments(model.data);

init();

// Ф-ция первоначальной инициализации
function init() {
  // Инициализация прослушек событий
  setupEventListeners();

  // Рендер и обновление кнопок пагинации в зависимости от текущей страницы
  reloadPaggination();
}

// Ф-ция передаваемая 1 раз при загрузки страницы в качестве callback при загрузке данных
// Для того, что бы на момент запроса отображать скелетоны, передаем limitComments и limitBtns для того,
// что бы понять какое количество комментов и кнопок под скелетоны мы хотим видеть
function toggleSkeleton(isLoading, limitComments, limitBtns) {
  // отображаем скелетоны
  view.toggleSkeleton(isLoading, limitComments, limitBtns);
}

// Инициализация прослушек событий
function setupEventListeners() {
  // Клик по контейнеру кнопок пагинации
  view.elements.paginationContainer.addEventListener("click", handlePageClick);

  // Клик по кнопке назад
  view.elements.btnPrev.addEventListener("click", handlePrevClick);

  // Клик по кнопке вперед
  view.elements.btnNext.addEventListener("click", handleNextClick);
}

// Клик по кнопке вперд
function handleNextClick() {
  //Общая ф-ция на основе которой будет выполняться логика по клику "Вперед", "Назад" или по кнопкам пагинации.
  // В качестве callback передаем асинхронную ф-цию по клику "Вперед" вперед из модели
  asyncOperation(() => model.handleNextClick());
}

// Клик по кнопке назад
function handlePrevClick() {
  //Общая ф-ция на основе которой будет выполняться логика по клику "Вперед", "Назад" или по кнопкам пагинации.
  // В качестве callback передаем асинхронную ф-цию по клику "Назад" из модели
  asyncOperation(() => model.handlePrevClick());
}

// Клик по контейнеру кнопок пагинации
function handlePageClick(e) {
  // Если мы совершили клик конкретно по кнопке пагинации
  if (e.target.classList.contains("pagination-btn")) {
    // То вырезаем ее текстовое содержимое
    const selectedPage = parseInt(e.target.textContent);

    // Достаем из модели метод clickPage и передаем в ф-цию асинхронной операции в качестве callback
    asyncOperation(() => model.clickPage(selectedPage));
  }
}

// Общая ф-ция на основе которой будет выполняться логика по клику "Вперед", "Назад" или по кнопкам пагинации.
// Логика при кликах будет одинаковая, единственное, асинхронная ф-ция будет выполняться разная, поэтому мы будем
// передавать ее в качестве callback и запускать asyncOperation при каждом клике на любую из кнопок
async function asyncOperation(callback) {
  try {
    // Блокируем все кнопки
    view.disableButtons();

    // Дожидаемся ответа от ассинхронного запроса принимаемого в кач-ве callback (handlePrevClick, handleNextClick или clickPage)
    // передаваемых в ф-циях выше из модели в зависимости от того, на какой элемент произошел клик
    await callback();

    // После ожидания ответа, мы рендерим все комменты
    view.renderComments(model.data);

    // Разблокирываем кнопки
    view.enableButtons();

    // Рендер и обновление кнопок пагинации в зависимости от текущей страницы
    reloadPaggination();
  } catch (error) {
    console.error("Async operation failed:", error.message);
  }
}

// Рендер и обновление кнопок пагинации в зависимости от текущей страницы
function reloadPaggination() {
  // Достаем нужные параметры из модели (Текущая страница, общее кол-во страниц, и диапазон отображаемых кнопок - start, end)
  const params = model.getParams();

  // Передаем параметры во view на отображение
  view.renderPagination(params);
}
