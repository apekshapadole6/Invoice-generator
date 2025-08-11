import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addEmployee,
  removeEmployee
} from "./routes/projects";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Projects API routes
  app.get("/api/projects", getProjects);
  app.get("/api/projects/:id", getProjectById);
  app.post("/api/projects", createProject);
  app.put("/api/projects/:id", updateProject);
  app.delete("/api/projects/:id", deleteProject);

  // Employee routes
  app.post("/api/projects/:id/employees", addEmployee);
  app.delete("/api/projects/:id/employees/:employeeId", removeEmployee);

  return app;
}
