const search = document.querySelector("#search-todo")
const todoList = document.querySelector("#todo-list")
const todoAddInput = document.querySelector(".todo-add input")
const todoAddBtn = document.querySelector(".todo-add button")
const sidebar = document.querySelector("#sidebar")
const sidebarViewBtn = document.querySelector("#sidebar-view-switch")
const filterOptions = document.querySelectorAll(".filter-option")
const filterContainer = document.querySelector("#filter-container")
const filterContainerTitle = document.querySelector("#filter-container-title")
const filterOptionsCountAll = document.querySelector("#all-todos .filter-option-count")
const filterOptionsCountDone = document.querySelector("#completed-todos .filter-option-count")
const filterOptionsCountPending = document.querySelector("#pending-todos .filter-option-count")

const toggleFiltersVisibility = () => {
    const isRetracted = sidebar.classList.contains("retract");

    if (isRetracted) {
        setTimeout(() => {
            filterContainerTitle.classList.remove("hide");
            filterContainer.classList.add("hide");
        }, 400);
    } else {
        filterContainerTitle.classList.add("hide");
        filterContainer.classList.remove("hide");
    }

    setSidebarShow();
};

// Evento de clique no botão
sidebarViewBtn.addEventListener("click", () => {
    sidebar.classList.toggle("retract");
    toggleFiltersVisibility();
});

document.addEventListener("DOMContentLoaded", toggleFiltersVisibility);

document.addEventListener("click", (e) => {
    const targetEl = e.target
    const targetNode = (targetEl.parentElement).parentElement


    if (targetEl.classList.contains("todo-remove-btn")) {
        const targetTitle = (targetNode.querySelector("#todo-title")).innerText
        removeTodoLocalStorage(targetTitle)
        targetNode.remove()
    }

    if (targetEl.classList.contains("todo-complete-btn")) {
        const targetTitle = (targetNode.querySelector("#todo-title")).innerText
        updateTodoStatusLocalStorage(targetTitle)
        targetNode.classList.toggle("done")
    }

    if (targetEl.classList.contains("todo-edit-btn")) {
        const todoTitle = targetNode.querySelector("#todo-title")
        const todoButtons = targetNode.querySelector(".todo-buttons")

        const inputNewTitle = document.createElement("input")
        inputNewTitle.value = todoTitle.innerText

        inputNewTitle.addEventListener("keyup", (e) => {
            const key = e.key

            if (key == "Enter") {
                saveBtn.dispatchEvent(new Event("click"))
            }
        })

        const editTodoButtons = document.createElement("div")
        editTodoButtons.classList.add("todo-buttons")

        const saveBtn = document.createElement("button")
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>'

        saveBtn.addEventListener("click", (e) => {
            const oldText = todoTitle.innerText
            const newText = inputNewTitle.value
            todoTitle.innerText = newText

            updateTodoTextLocalStorage(oldText, newText)
            targetNode.replaceChild(todoTitle, inputNewTitle)
            targetNode.replaceChild(todoButtons, editTodoButtons)
        })

        const cancelBtn = document.createElement("button")
        cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>'

        cancelBtn.addEventListener("click", (e) => {
            targetNode.replaceChild(todoTitle, inputNewTitle)
            targetNode.replaceChild(todoButtons, editTodoButtons)
        })

        editTodoButtons.append(cancelBtn, saveBtn)

        targetNode.replaceChild(inputNewTitle, todoTitle)
        inputNewTitle.focus()

        targetNode.replaceChild(editTodoButtons, todoButtons)
    }
})

todoAddBtn.addEventListener("click", (e) => {
    e.preventDefault()

    const newTodoTitle = todoAddInput.value

    if (newTodoTitle) {
        saveTodo(newTodoTitle)
    }
})

todoAddInput.addEventListener("keydown", (e) => {
    const key = e.key

    if (key == "Enter") {
        todoAddBtn.dispatchEvent(new Event("click"))
    }
})

search.addEventListener("keyup", (e) => {
    const todos = document.querySelectorAll(".todo")
    const text = (e.target.value).toLowerCase()

    for (todo of todos) {
        const titleTodo = (todo.querySelector("h4")).innerText.toLowerCase()

        if (!titleTodo.includes(text)) {
            todo.classList.add("hide")
        } else {
            todo.classList.remove("hide")
        }
    }
})

filterOptions.forEach((filterOption) => {
    filterOption.addEventListener("click", (e) => {
        e.preventDefault()
        const id = filterOption.getAttribute("id")
        const todos = document.querySelectorAll(".todo")

        for (option of filterOptions) {
            if (option.getAttribute("id") == id) {
                option.classList.add("selected")
            } else {
                option.classList.remove("selected")
            }
        }

        const statusDone = id == "completed-todos" ? true : (id == "pending-todos" ? false : null)

        for (todo of todos) {
            if (statusDone == null) {
                todo.classList.remove("hide")
            }
            else if (statusDone == todo.classList.contains("done")) {
                todo.classList.remove("hide")
            } else {
                todo.classList.add("hide")
            }
        }
    })
})

const getTodosLocalStorage = () => {
    const todos = JSON.parse(localStorage.getItem("todos")) || []
    return todos
}

const saveTodo = (text, done = false, save = true) => {
    const newTodo = document.createElement("div")
    newTodo.classList.add("todo")

    newTodo.innerHTML = `<h4 id="todo-title">${text}</h4>
    <div class="todo-buttons"><button class="todo-remove-btn"><i class="fa-solid fa-trash"></i></button><button class="todo-edit-btn"><i class="fa-solid fa-pen"></i></button><button class="todo-complete-btn"><i class="fa-solid fa-check"></i></button></ >`

    if (done) {
        newTodo.classList.add("done")
    }

    if (save) {
        addTodoLocalStorage({ text, done })
    }

    todoList.appendChild(newTodo)
    todoAddInput.value = ""
}

const addTodoLocalStorage = (todo) => {
    const todos = getTodosLocalStorage()

    todos.push(todo)

    localStorage.setItem("todos", JSON.stringify(todos))
    
    countTodosLocalStorage(todos)
}

const loadTodos = () => {
    const todos = getTodosLocalStorage()

    for (todo of todos) {
        saveTodo(todo.text, todo.done, 0)
    }

    countTodosLocalStorage(todos)
}

const countTodosLocalStorage = (todos) => {
    let doneTodos = 0
    let pendingTodos = 0

    for (todo of todos) {
        if (todo.done == true) {
            doneTodos++
        } else {
            pendingTodos++
        }
    }

    let allTodos = doneTodos + pendingTodos

    filterOptionsCountAll.innerText = allTodos
    filterOptionsCountDone.innerText = doneTodos
    filterOptionsCountPending.innerText = pendingTodos
}

const updateTodoStatusLocalStorage = (todoText) => {
    const todos = getTodosLocalStorage()

    todos.map((todo) => {
        todo.text === todoText ? (todo.done = !todo.done) : null
    })

    localStorage.setItem("todos", JSON.stringify(todos))
    countTodosLocalStorage(todos)
}

const updateTodoTextLocalStorage = (oldTodoText, newTodoText) => {
    const todos = getTodosLocalStorage()

    todos.map((todo) => {
        todo.text == oldTodoText ? (todo.text = newTodoText) : null
    })

    localStorage.setItem("todos", JSON.stringify(todos))
}

const removeTodoLocalStorage = (todoText) => {
    const todos = getTodosLocalStorage()

    const newTodos = todos.filter((todo) => {
        return todo.text !== todoText
    })

    localStorage.setItem("todos", JSON.stringify(newTodos))
    countTodosLocalStorage(newTodos)
}

const loadSidebarShow = () => {
    const sidebarShow = JSON.parse(localStorage.getItem("sidebarShow")) || []

    if (sidebarShow === true) {
        sidebar.classList.add("retract")
    } else if (sidebarShow === false) {
        sidebar.classList.remove("retract")
    }
}

const setSidebarShow = () => {
    if (!sidebar.classList.contains("retract")) {
        localStorage.setItem("sidebarShow", false)
    } else {
        localStorage.setItem("sidebarShow", true)
    }
}

loadSidebarShow()
loadTodos()