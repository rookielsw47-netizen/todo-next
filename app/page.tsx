'use client'

import { useEffect, useRef, useState } from 'react'

const CATEGORIES = ['전체', '개인', '업무', '쇼핑', '건강', '기타'] as const
type Category = (typeof CATEGORIES)[number]

const CAT_COLORS: Record<string, string> = {
  개인: '#6C63FF',
  업무: '#00BCD4',
  쇼핑: '#FF9800',
  건강: '#4CAF50',
  기타: '#9E9E9E',
}

interface Todo {
  id: string
  title: string
  category: string
  isDone: boolean
  dueDate: string | null
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function isOverdue(todo: Todo) {
  if (todo.isDone || !todo.dueDate) return false
  return new Date(todo.dueDate) < new Date(new Date().toDateString())
}

function TodoCard({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  const color = CAT_COLORS[todo.category] ?? '#9E9E9E'
  const overdue = isOverdue(todo)

  return (
    <div
      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm mb-2.5 cursor-pointer group"
      onClick={onEdit}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
        style={{ borderColor: color, backgroundColor: todo.isDone ? color : 'transparent' }}
      >
        {todo.isDone && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${todo.isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-lg"
            style={{ color, backgroundColor: color + '20' }}
          >
            {todo.category}
          </span>
          {todo.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {new Date(todo.dueDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function TodoModal({
  todo,
  onClose,
  onSave,
}: {
  todo?: Todo
  onClose: () => void
  onSave: (title: string, category: string, dueDate: string | null) => void
}) {
  const [title, setTitle] = useState(todo?.title ?? '')
  const [category, setCategory] = useState(todo?.category ?? '개인')
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave(title.trim(), category, dueDate || null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
        <h2 className="text-lg font-bold mb-4">{todo ? '할 일 수정' : '할 일 추가'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="w-full bg-[#f5f5fa] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/40"
          />

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c !== '전체').map((c) => {
                const color = CAT_COLORS[c]
                const selected = category === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: selected ? color : color + '18',
                      color: selected ? '#fff' : color,
                    }}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">마감일</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[#f5f5fa] rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/40"
              />
              {dueDate && (
                <button type="button" onClick={() => setDueDate('')} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {todo ? '수정 완료' : '추가'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedCat, setSelectedCat] = useState<Category>('전체')
  const [modal, setModal] = useState<{ open: boolean; todo?: Todo }>({ open: false })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem('todos')
      if (raw) setTodos(JSON.parse(raw))
    } catch {}
  }, [])

  function save(next: Todo[]) {
    setTodos(next)
    localStorage.setItem('todos', JSON.stringify(next))
  }

  function addTodo(title: string, category: string, dueDate: string | null) {
    save([...todos, { id: genId(), title, category, isDone: false, dueDate }])
  }

  function editTodo(id: string, title: string, category: string, dueDate: string | null) {
    save(todos.map((t) => (t.id === id ? { ...t, title, category, dueDate } : t)))
  }

  function toggleTodo(id: string) {
    save(todos.map((t) => (t.id === id ? { ...t, isDone: !t.isDone } : t)))
  }

  function deleteTodo(id: string) {
    save(todos.filter((t) => t.id !== id))
  }

  const filtered = selectedCat === '전체' ? todos : todos.filter((t) => t.category === selectedCat)
  const doneCount = todos.filter((t) => t.isDone).length

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#f5f5fa]">
      <div className="max-w-lg mx-auto px-4 pt-10 pb-28">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Todo</h1>
          <span className="text-sm text-gray-400">{doneCount}/{todos.length} 완료</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                selectedCat === c
                  ? { backgroundColor: '#6C63FF', color: '#fff', boxShadow: '0 2px 8px #6C63FF55' }
                  : { backgroundColor: '#fff', color: '#888' }
              }
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <svg className="w-16 h-16 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">할 일이 없습니다</p>
          </div>
        ) : (
          filtered.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
              onEdit={() => setModal({ open: true, todo })}
            />
          ))
        )}
      </div>

      <button
        onClick={() => setModal({ open: true })}
        className="fixed bottom-6 right-6 sm:right-[max(1.5rem,calc(50%-11rem))] flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-semibold px-5 py-3.5 rounded-full shadow-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        할 일 추가
      </button>

      {modal.open && (
        <TodoModal
          todo={modal.todo}
          onClose={() => setModal({ open: false })}
          onSave={(title, category, dueDate) => {
            if (modal.todo) editTodo(modal.todo.id, title, category, dueDate)
            else addTodo(title, category, dueDate)
          }}
        />
      )}
    </div>
  )
}
