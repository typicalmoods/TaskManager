import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5279/api/Tasks";
const CATEGORIES_URL = "http://localhost:5279/api/Categories";

function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [taskEditando, setTaskEditando] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error("Error al cargar las tareas:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(CATEGORIES_URL);
      setCategories(response.data);
    } catch (error) {
      console.error("Error al cargar las categorías:", error);
    }
  };

  const createTask = async () => {
    if (!titulo) return;
    try {
      await axios.post(API_URL, {
        titulo,
        descripcion,
        completada: false,
        fechaLimite: fechaLimite ? `${fechaLimite}T00:00:00` : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
      });
      setTitulo("");
      setDescripcion("");
      setFechaLimite("");
      setCategoryId("");
      fetchTasks();
      mostrarToast("✅ Tarea añadida correctamente");
    } catch (error) {
      console.error("Error al crear la tarea:", error);
    }
  };

  const updateTask = async () => {
    if (!taskEditando.titulo) return;
    try {
      await axios.put(`${API_URL}/${taskEditando.id}`, taskEditando);
      setTaskEditando(null);
      fetchTasks();
      mostrarToast("✅ Tarea actualizada correctamente");
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API_URL}/${task.id}`, {
        ...task,
        completada: !task.completada,
      });
      fetchTasks();
      mostrarToast(
        task.completada ? "↩️ Tarea desmarcada" : "✅ Tarea completada",
      );
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
      mostrarToast("🗑️ Tarea eliminada");
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  const tareasFiltradas = tasks.filter((task) => {
    if (filtro === "pendientes") return !task.completada;
    if (filtro === "completadas") return task.completada;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Task Manager</h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Nueva tarea
          </h2>
          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={createTask}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
          >
            Añadir tarea
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {["todas", "pendientes", "completadas"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filtro === f ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tareasFiltradas.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl shadow p-5 border-l-4 ${task.completada ? "border-green-400" : "border-blue-400"}`}
            >
              <div className="flex justify-between items-start">
                <h3
                  className={`text-lg font-semibold ${task.completada ? "line-through text-gray-400" : "text-gray-800"}`}
                >
                  {task.titulo}
                </h3>
                {task.categoryId && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {categories.find((c) => c.id === task.categoryId)?.nombre}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">{task.descripcion}</p>
              {task.fechaLimite && (
                <p className="text-xs text-gray-400 mt-1">
                  📅 Fecha límite:{" "}
                  {new Date(task.fechaLimite).toLocaleDateString()}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleComplete(task)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${task.completada ? "bg-gray-200 hover:bg-gray-300 text-gray-700" : "bg-green-500 hover:bg-green-600 text-white"}`}
                >
                  {task.completada ? "Desmarcar" : "Completar"}
                </button>
                <button
                  onClick={() => setTaskEditando(task)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-yellow-400 hover:bg-yellow-500 text-white transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition-opacity duration-500 ${toastVisible ? "opacity-100" : "opacity-0"}`}
        >
          {toast}
        </div>
      )}

      {taskEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Editar tarea
            </h2>
            <input
              value={taskEditando.titulo}
              onChange={(e) =>
                setTaskEditando({ ...taskEditando, titulo: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              value={taskEditando.descripcion}
              onChange={(e) =>
                setTaskEditando({
                  ...taskEditando,
                  descripcion: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              value={
                taskEditando.fechaLimite
                  ? taskEditando.fechaLimite.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setTaskEditando({
                  ...taskEditando,
                  fechaLimite: e.target.value
                    ? `${e.target.value}T00:00:00`
                    : null,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={taskEditando.categoryId || ""}
              onChange={(e) =>
                setTaskEditando({
                  ...taskEditando,
                  categoryId: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={updateTask}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
              >
                Guardar
              </button>
              <button
                onClick={() => setTaskEditando(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
