import { useState, useRef } from 'react'

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Read a book', done: false, dueDate: null },
    { id: 2, text: 'Go for a walk', done: true, dueDate: null },
    { id: 3, text: 'Write some code', done: false, dueDate: null },
  ])

  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')

  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editDueDate, setEditDueDate] = useState('')

  const editRef = useRef(null)

  const addTodo = () => {
    const text = input.trim()
    if (!text) return

    setTodos([
      ...todos,
      {
        id: Date.now(),
        text,
        done: false,
        dueDate: dueDate || null,
      },
    ])

    setInput('')
    setDueDate('')
  }

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const deleteTodo = (id) => setTodos(todos.filter((t) => t.id !== id))

  // --- Editing ---
  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
    setEditDueDate(todo.dueDate || '')
  }

  const saveEdit = () => {
    const text = editText.trim()

    if (!text) {
      deleteTodo(editingId)
    } else {
      setTodos(
        todos.map((t) =>
          t.id === editingId
            ? { ...t, text, dueDate: editDueDate || null }
            : t
        )
      )
    }

    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  // 🔑 FIX: only save when focus leaves the whole edit container
  const handleBlur = (e) => {
    if (!editRef.current?.contains(e.relatedTarget)) {
      saveEdit()
    }
  }

  // --- end editing ---

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.done : filter === 'completed' ? t.done : true
  )

  const remaining = todos.filter((t) => !t.done).length

  const isOverdue = (todo) => {
    if (todo.done || !todo.dueDate) return false
    const today = new Date()
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
    const dueDateValue = new Date(todo.dueDate)
    return dueDateValue < todayStart
  }

  const tabClass = (name) =>
    `px-3 py-1 rounded-md text-sm font-medium transition ${
      filter === name
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-200'
    }`

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo List</h1>

        {/* Create */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs doing?"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md"
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-2 py-2 border border-slate-300 rounded-md"
          />

          <button
            onClick={addTodo}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={tabClass('all')}>
            All
          </button>
          <button onClick={() => setFilter('active')} className={tabClass('active')}>
            Active
          </button>
          <button onClick={() => setFilter('completed')} className={tabClass('completed')}>
            Completed
          </button>
        </div>

        {/* List */}
        <ul className="space-y-2">
          {visible.map((todo) => {
            const overdue = isOverdue(todo)

            return (
              <li
                key={todo.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border overflow-hidden ${
                  overdue ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              >
                {editingId === todo.id ? (
                  <div
                    ref={editRef}
                    onBlur={handleBlur}
                    className="flex flex-1 items-center gap-2"
                  >
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 min-w-0 px-2 py-1 border rounded"
                    />

                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-36 px-2 py-1 border rounded"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    onDoubleClick={() => startEdit(todo)}
                    className={`flex-1 text-left ${
                      todo.done ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {todo.text}
                    {todo.dueDate && (
                      <span className="ml-2 text-xs text-slate-500">
                        (Due: {new Date(todo.dueDate).toLocaleDateString()})
                      </span>
                    )}
                    {overdue && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Overdue
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="shrink-0 text-slate-400 hover:text-red-500 text-lg font-bold px-2"
                >
                  ×
                </button>
              </li>
            )
          })}

          {visible.length === 0 && (
            <li className="text-center text-slate-400 py-4 text-sm">
              Nothing here.
            </li>
          )}
        </ul>

        <div className="mt-4 text-sm text-slate-500">
          {remaining} {remaining === 1 ? 'item' : 'items'} left
        </div>
      </div>
    </div>
  )
}