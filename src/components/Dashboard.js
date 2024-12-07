import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/Styles.css";
import { API_BASE_URL } from "./Config";

const COLORS = ["#bac8ff", "#3d53db", "#2a3bb7", "#1a2793", "#1a2793"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [boardData, setBoardData] = useState([]);
  const [cardStats, setCardStats] = useState({
    total: 0,
    active: 0,
    in_progress: 0,
    completed: 0,
  });
  const [pieData, setPieData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [error, setError] = useState("");

  // Fetch dashboard and boards data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, boardsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard`, { method: "GET", credentials: "include" }),
          fetch(`${API_BASE_URL}/boards`, { method: "GET", credentials: "include" }),
        ]);

        if (!dashboardResponse.ok) throw new Error("Failed to fetch dashboard data");
        if (!boardsResponse.ok) throw new Error("Failed to fetch boards data");

        const dashboardData = await dashboardResponse.json();
        const boardsData = await boardsResponse.json();

        // Update state for boards and card statistics
        setBoardData(boardsData.boards || []);
        setCardStats({
          total: dashboardData.total || 0,
          active: dashboardData.active || 0,
          in_progress: dashboardData.in_progress || 0,
          completed: dashboardData.completed || 0,
        });

        // Prepare pie chart data
        setPieData([
          { name: "Active Cards", value: dashboardData.active || 0 },
          { name: "In Progress Cards", value: dashboardData.in_progress || 0 },
          { name: "Completed Cards", value: dashboardData.completed || 0 },
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data.");
      }
    };

    fetchDashboardData();
  }, []);

  const handleAddBoardClick = () => navigate("/add-board");
  const handleViewBoard = (boardId) => navigate(`/tasks/${boardId}`);
  const handleEditBoard = (board) => {
    setSelectedBoard(board);
    setUpdatedName(board.name);
    setUpdatedDescription(board.description);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!updatedName || !updatedDescription) {
      setError("Name and description are required");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/board/update/${selectedBoard._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: updatedName, description: updatedDescription }),
        }
      );

      if (!response.ok) throw new Error("Failed to update board");

      const updatedBoard = await response.json();
      setBoardData((prevData) =>
        prevData.map((board) =>
          board._id === updatedBoard._id
            ? { ...board, name: updatedName, description: updatedDescription }
            : board
        )
      );
      setShowEditModal(false);
      setSelectedBoard(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseBoard = async (boardId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/board/close/${boardId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to close board");

      setBoardData((prevData) => prevData.filter((board) => board._id !== boardId));
    } catch (err) {
      console.error("Error closing board:", err);
    }
  };

  return (
    <div className="dashboard-container p-4">
      <h2 className="dash-heading">Dashboard</h2>
      {error && <p className="text-danger">{error}</p>}
      {!error && (
        <>
          <p className="lead mb-4">
            Below is the overview of your boards and card statistics.
          </p>

          {/* Statistics Section */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm h-100" style={{ backgroundColor: "#fcfcfc", color: "#1a2793" }}>
                <div className="card-body text-center">
                  <h6 className="stat-title">Total Cards</h6>
                  <p className="h3 mb-0">{cardStats.total}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm h-100" style={{ backgroundColor: "#fcfcfc", color: "#1a2793" }}>
                <div className="card-body text-center">
                  <h6 className="stat-title">Active Cards</h6>
                  <p className="h3 mb-0">{cardStats.active}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm h-100" style={{ backgroundColor: "#fcfcfc", color: "#1a2793" }}>
                <div className="card-body text-center">
                  <h6 className="stat-title">In Progress Cards</h6>
                  <p className="h3 mb-0">{cardStats.in_progress}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm h-100" style={{ backgroundColor: "#fcfcfc", color: "#1a2793" }}>
                <div className="card-body text-center">
                  <h6 className="stat-title">Completed Cards</h6>
                  <p className="h3 mb-0">{cardStats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Pie Chart */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Card Distribution</h5>
                  <PieChart width={400} height={300}>
                    <Pie
                      data={pieData}
                      cx={200}
                      cy={120}
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>

            {/* Boards Table */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Boards Information</h5>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Board Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boardData.map((board) => (
                        <tr key={board._id}>
                          <td>{board.name}</td>
                          <td>{board.status}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button size="sm" className="action-button"
                              onClick={() => handleViewBoard(board._id)}>
                                View
                              </Button>
                              <Button size="sm"  className="action-button"
                              onClick={() => handleEditBoard(board)}>
                                Edit
                              </Button>
                              <Button size="sm" className="action-button"
                              onClick={() => handleCloseBoard(board._id)}>
                                Close
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          <button className="floating-action-button" onClick={handleAddBoardClick}>
            +
          </button>

          {/* Edit Board Modal */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Board</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <p className="text-danger">{error}</p>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Board Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={updatedDescription}
                    onChange={(e) => setUpdatedDescription(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Dashboard;


