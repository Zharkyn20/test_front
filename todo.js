(function (global) {
  function initTodoApp(root = global.document, options = {}) {
    if (!root) {
      throw new Error('initTodoApp requires a document or document-like root');
    }

    const removalDelay = options.removalDelay ?? 400;

    const form = root.getElementById('todo-form');
    const input = root.getElementById('task-input');
    const list = root.getElementById('task-list');
    const totalCount = root.getElementById('total-count');
    const completedCount = root.getElementById('completed-count');
    const filterButtons = root.querySelectorAll('.filter-button');

    if (!form || !input || !list || !totalCount || !completedCount) {
      throw new Error('initTodoApp requires a complete To-Do markup');
    }

    let activeFilter = 'all';

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) {
        return;
      }
      addTask(text);
      input.value = '';
      input.focus();
    });

    function addTask(text) {
      const item = root.createElement('li');
      item.className = 'task-item';

      const checkbox = root.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-toggle';
      checkbox.setAttribute('aria-label', 'Отметить задачу как выполненную');

      const title = root.createElement('span');
      title.className = 'task-title';
      title.textContent = text;

      const removeButton = root.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = 'Удалить';
      removeButton.addEventListener('click', () => {
        if (item.classList.contains('removing')) {
          return;
        }

        item.classList.add('removing');
        removeButton.disabled = true;

        let isRemoved = false;
        const finalizeRemoval = () => {
          if (isRemoved || !list.contains(item)) {
            return;
          }
          isRemoved = true;
          list.removeChild(item);
          updateCounters();
          applyFilter();
        };

        item.addEventListener('transitionend', function handleTransition(event) {
          if (event.target !== item || event.propertyName !== 'opacity') {
            return;
          }
          item.removeEventListener('transitionend', handleTransition);
          finalizeRemoval();
        });

        setTimeout(finalizeRemoval, removalDelay);
      });

      checkbox.addEventListener('change', () => {
        item.classList.toggle('completed', checkbox.checked);
        updateCounters();
        applyFilter();
      });

      item.append(checkbox, title, removeButton);
      list.appendChild(item);
      updateCounters();
      applyFilter();
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const { filter } = button.dataset;
        if (filter === activeFilter) {
          return;
        }
        setActiveFilter(filter);
      });
    });

    function setActiveFilter(filter) {
      activeFilter = filter;
      filterButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.filter === filter);
      });
      applyFilter();
    }

    function updateCounters() {
      const items = Array.from(list.children);
      const total = items.length;
      const completed = items.filter((task) => task.classList.contains('completed')).length;
      totalCount.textContent = total;
      completedCount.textContent = completed;
    }

    function applyFilter() {
      const items = Array.from(list.children);
      items.forEach((item) => {
        if (item.classList.contains('removing')) {
          item.style.display = '';
          return;
        }

        const isCompleted = item.classList.contains('completed');
        const shouldShow =
          activeFilter === 'all' ||
          (activeFilter === 'active' && !isCompleted) ||
          (activeFilter === 'completed' && isCompleted);

        item.style.display = shouldShow ? '' : 'none';
      });
    }

    updateCounters();
    applyFilter();

    return {
      addTask,
      setActiveFilter,
      applyFilter,
      updateCounters,
      getTasks: () => Array.from(list.children),
      getVisibleTasks: () => Array.from(list.children).filter((item) => item.style.display !== 'none'),
      getStats: () => ({
        total: Number(totalCount.textContent),
        completed: Number(completedCount.textContent),
      }),
      getActiveFilter: () => activeFilter,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initTodoApp };
  }

  if (global && typeof global === 'object') {
    const target = global;
    target.todoApp = target.todoApp || {};
    target.todoApp.initTodoApp = initTodoApp;
  }
})(typeof window !== 'undefined' ? window : globalThis);
