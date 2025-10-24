const { initTodoApp } = require('./todo');

function setupDom() {
  document.body.innerHTML = `
    <main class="container">
      <section class="top-bar">
        <p class="stats" aria-live="polite">
          Всего: <span class="highlight" id="total-count">0</span>
          <span aria-hidden="true">•</span>
          Выполнено: <span class="highlight" id="completed-count">0</span>
        </p>
        <div class="filters" role="group" aria-label="Фильтр задач">
          <button type="button" class="filter-button active" data-filter="all">Показать все</button>
          <button type="button" class="filter-button" data-filter="active">Показать активные</button>
          <button type="button" class="filter-button" data-filter="completed">Показать выполненные</button>
        </div>
      </section>
      <form id="todo-form">
        <input type="text" id="task-input" placeholder="Введите задачу" required>
        <button type="submit">Добавить</button>
      </form>
      <ul id="task-list"></ul>
    </main>
  `;
}

describe('To-Do app core logic', () => {
  beforeEach(() => {
    setupDom();
  });

  test('добавление задачи обновляет список и счётчики', () => {
    const app = initTodoApp(document);

    app.addTask('Новая задача');

    const tasks = app.getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].querySelector('.task-title').textContent).toBe('Новая задача');

    const stats = app.getStats();
    expect(stats.total).toBe(1);
    expect(stats.completed).toBe(0);
  });

  test('удаление задачи удаляет элемент и обновляет счётчики', () => {
    const app = initTodoApp(document, { removalDelay: 0 });

    app.addTask('Задача для удаления');

    const [task] = app.getTasks();
    const removeButton = task.querySelector('button');
    removeButton.click();

    const transitionEvent = new Event('transitionend');
    Object.defineProperty(transitionEvent, 'propertyName', {
      value: 'opacity',
    });
    task.dispatchEvent(transitionEvent);

    expect(app.getTasks()).toHaveLength(0);
    const stats = app.getStats();
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
  });

  test('фильтрация задач показывает корректные элементы', () => {
    const app = initTodoApp(document);

    app.addTask('Активная задача');
    app.addTask('Выполненная задача');

    const tasks = app.getTasks();
    const completedCheckbox = tasks[1].querySelector('.task-toggle');
    completedCheckbox.checked = true;
    completedCheckbox.dispatchEvent(new Event('change'));

    app.setActiveFilter('active');
    let visibleTasks = app.getVisibleTasks();
    expect(visibleTasks).toHaveLength(1);
    expect(visibleTasks[0].querySelector('.task-title').textContent).toBe('Активная задача');

    app.setActiveFilter('completed');
    visibleTasks = app.getVisibleTasks();
    expect(visibleTasks).toHaveLength(1);
    expect(visibleTasks[0].querySelector('.task-title').textContent).toBe('Выполненная задача');
  });
});
