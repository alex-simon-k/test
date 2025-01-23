'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useAuth } from '@/lib/hooks/useAuth'

interface TaskCreator {
  uid: string;
  email: string | null;
  role: 'company' | 'student' | null;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  createdBy: TaskCreator;
  projectId: string;
  deadline: string | null;
}

interface TaskBoardProps {
  projectId: string;
  isCompanyOwner: boolean;
  userRole: 'company' | 'student' | null;
}

const taskStatuses = ['todo', 'in-progress', 'completed', 'archived'] as const
type TaskStatus = typeof taskStatuses[number]

function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function TaskBoard({ projectId, isCompanyOwner, userRole }: TaskBoardProps) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isEditingTask, setIsEditingTask] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: ''
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    console.log('TaskBoard mounting with:', {
      projectId,
      userRole,
      isCompanyOwner
    })
    
    if (!projectId) {
      console.error('No projectId provided to TaskBoard')
      return
    }

    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
      console.log('Tasks loaded:', {
        count: tasksData.length,
        tasks: tasksData
      })
      setTasks(tasksData)
    })

    return () => unsubscribe()
  }, [projectId, userRole, isCompanyOwner])

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const taskRef = doc(db, 'tasks', draggableId)
    await updateDoc(taskRef, {
      status: destination.droppableId as TaskStatus
    })

    const updatedTasks = tasks.map(task => 
      task.id === draggableId 
        ? { ...task, status: destination.droppableId as TaskStatus }
        : task
    )
    setTasks(updatedTasks)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      console.log('Adding task with deadline:', newTask.deadline)
      const taskData = {
        ...newTask,
        deadline: newTask.deadline || null,
        projectId,
        status: 'todo',
        createdAt: new Date().toISOString(),
        createdBy: {
          uid: user.uid,
          email: user.email,
          role: userRole
        },
        assignedTo: [],
        comments: [],
        attachments: []
      }
      console.log('Creating task with data:', taskData)
      await addDoc(collection(db, 'tasks'), taskData)
      setIsAddingTask(false)
      setNewTask({ title: '', description: '', priority: 'medium', deadline: '' })
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingTask) return

    try {
      console.log('Saving task:', {
        taskId: editingTask.id,
        updates: {
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          deadline: editingTask.deadline,
        }
      })
      
      const taskRef = doc(db, 'tasks', editingTask.id)
      const updatedTask = {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        deadline: editingTask.deadline,
        updatedAt: new Date().toISOString(),
        updatedBy: {
          uid: user.uid,
          email: user.email,
          role: userRole
        }
      }
      
      await updateDoc(taskRef, updatedTask)
      console.log('Task updated successfully')
      setIsEditingTask(null)
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleArchiveTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        status: 'archived'
      })
    } catch (error) {
      console.error('Error archiving task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return

    try {
      const taskRef = doc(db, 'tasks', taskId)
      await deleteDoc(taskRef)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const canCreateTasks = userRole === 'company' || userRole === 'student'
  console.log('Can create tasks:', canCreateTasks, 'userRole:', userRole)

  const visibleTasks = tasks.filter(task => showArchived ? true : task.status !== 'archived')

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          {canCreateTasks && (
            <button
              onClick={() => setIsAddingTask(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Task
            </button>
          )}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg ${
              showArchived
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {isAddingTask && (
        <form onSubmit={handleAddTask} className="mb-6 space-y-4 bg-white p-4 rounded-lg shadow-sm border">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
              required
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
              rows={3}
              required
              placeholder="Enter task description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="datetime-local"
              value={newTask.deadline}
              onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {taskStatuses.filter(status => status !== 'archived' || showArchived).map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-50 p-4 rounded-lg ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-4 capitalize">{status}</h3>
                  <div className="space-y-4">
                    {visibleTasks
                      .filter(task => task.status === status)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => {
                                console.log('Opening task for editing with deadline:', task.deadline)
                                const formattedDeadline = task.deadline || ''
                                console.log('Formatted deadline for input:', formattedDeadline)
                                setIsEditingTask(task.id)
                                setEditingTask({ ...task, deadline: formattedDeadline })
                              }}
                            >
                              {isEditingTask === task.id ? (
                                <form onSubmit={handleEditTask} className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                                    <input
                                      type="text"
                                      value={editingTask?.title || ''}
                                      onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                                      className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                                      required
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                      value={editingTask?.description || ''}
                                      onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                                      className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                                      rows={3}
                                      required
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                      value={editingTask?.priority || 'medium'}
                                      onChange={(e) => setEditingTask(prev => prev ? { ...prev, priority: e.target.value as 'low' | 'medium' | 'high' } : null)}
                                      className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                    <input
                                      type="datetime-local"
                                      value={editingTask?.deadline || ''}
                                      onChange={(e) => {
                                        const newDeadline = e.target.value
                                        console.log('New deadline selected:', newDeadline)
                                        setEditingTask(prev => prev ? { 
                                          ...prev, 
                                          deadline: newDeadline || null 
                                        } : null)
                                      }}
                                      className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsEditingTask(null)
                                        setEditingTask(null)
                                      }}
                                      className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <>
                                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      task.priority === 'high'
                                        ? 'bg-red-100 text-red-800'
                                        : task.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    {task.deadline && (
                                      <span className="text-xs text-gray-500">
                                        Due: {new Date(task.deadline).toLocaleString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          timeZone: 'UTC'
                                        })}
                                      </span>
                                    )}
                                    <div className="flex items-center space-x-2">
                                      {task.createdBy && (
                                        <span className="text-xs text-gray-500">
                                          Created by {task.createdBy.email}
                                        </span>
                                      )}
                                      {task.status === 'completed' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleArchiveTask(task.id)
                                          }}
                                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                        >
                                          Archive
                                        </button>
                                      )}
                                      {task.status === 'archived' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteTask(task.id)
                                          }}
                                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
} 