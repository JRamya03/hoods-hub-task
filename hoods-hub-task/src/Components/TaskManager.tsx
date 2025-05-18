import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './taskManager.css';

type Task = {
  _id: string;
  title: string;
  completed: boolean;
};

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [error, setError] = useState('');

  const baseURL = 'http://localhost:5000/tasks';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(baseURL);
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      setError('Task title is required');
      return;
    }
    try {
      const res = await axios.post(baseURL, {
        title: newTaskTitle.trim(),
      });
      setTasks((prev) => [...prev, res.data]);
      setNewTaskTitle('');
      setError('');
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      await axios.put(`${baseURL}/${id}`, { completed: true });
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, completed: true } : task
        )
      );
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`${baseURL}/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task._id);
    setEditedTaskTitle(task.title);
    setError('');
  };

  const handleSaveEditedTask = async (id: string) => {
    if (!editedTaskTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    try {
      await axios.put(`${baseURL}/${id}`, { title: editedTaskTitle });
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, title: editedTaskTitle } : task
        )
      );
      setEditingTaskId(null);
      setEditedTaskTitle('');
      setError('');
    } catch (err) {
      setError('Failed to update task');
    }
  };

  return (
    <div className="task-container">
      <h2>Task Manager</h2>

      <div className="task-form">
        <input
          type="text"
          placeholder="Enter task title"
          value={newTaskTitle}
          onChange={(e) => {
            setNewTaskTitle(e.target.value);
            setError('');
          }}
          className="task-input"
        />
        <button onClick={handleAddTask} className="add-button">
          Add Task
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className="task-item">
            {editingTaskId === task._id ? (
              <>
                <input
                  type="text"
                  value={editedTaskTitle}
                  onChange={(e) => setEditedTaskTitle(e.target.value)}
                  className="task-edit-input"
                />
                <button
                  onClick={() => handleSaveEditedTask(task._id)}
                  className="save-button"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span
                  className={`task-title ${task.completed ? 'completed' : ''}`}
                >
                  {task.title}
                </span>
                <span className="task-status">
                  {task.completed ? ' Completed' : ' Pending'}
                </span>
                {!task.completed && (
                  <button
                    onClick={() => markAsCompleted(task._id)}
                    className="complete-button"
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => handleEditTask(task)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;
