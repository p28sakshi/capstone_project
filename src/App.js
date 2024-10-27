import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./components/Auth/AuthContext";
import ErrorBoundary from "./components/Auth/ErrrorBoundary";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Login";
import Body from "./components/Body";
import Tasks from "./components/Tasks";
import TaskDetails from "./components/TaskDetails";
import Dashboard from "./components/Dashboard";
import Hompage from "./components/Hompage";
import Forget from "./components/Forget-password";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Body />,
    children: [
      { path: "/", element: <Hompage /> },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/tasks",
        element: (
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        ),
      },
      {
        path: "/task/:cardId",
        element: (
          <ProtectedRoute>
            <TaskDetails />
          </ProtectedRoute>
        ),
      },
      { path: "/login", element: <Login /> },
      { path: "/forget-password", element: <Forget /> },
      { path: "*", element: <p>404 Page Not Found</p> },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
