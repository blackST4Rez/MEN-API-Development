import request from "supertest";
import createTestApp from "./test-app";
import { Task } from "../models/Task";
import { createTestUser, createTestUser2 } from "./setup";

const app = createTestApp();

describe("Tasks API", () => {
  let authToken1: string;
  let authToken2: string;
  let user1Id: string;
  let user2Id: string;

  beforeEach(async () => {
    const { token: token1, user: u1 } = await createTestUser();
    const { token: token2, user: u2 } = await createTestUser2();

    authToken1 = token1;
    authToken2 = token2;
    user1Id = u1._id.toString();
    user2Id = u2._id.toString();
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.completed).toBe(false);
      expect(response.body.data.createdBy.toString()).toBe(user1Id);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test Task" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some((e: any) => e.field === "title")).toBe(true);
    });

    it("should return validation error for empty title", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: "" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });

    it("should return validation error for title too long", async () => {
      const longTitle = "a".repeat(101);
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: longTitle })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });

    it("should return validation error for invalid priority", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: "Test", priority: "invalid" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });

    it("should accept valid priority values", async () => {
      const priorities = ["low", "medium", "high"];
      
      for (const priority of priorities) {
        const response = await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ title: `Test ${priority}`, priority })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.priority).toBe(priority);
      }
    });
  });

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      await Task.create([
        { title: "Task 1", completed: false, priority: "low", createdBy: user1Id },
        { title: "Task 2", completed: true, priority: "high", createdBy: user1Id },
        { title: "Task 3", completed: false, priority: "medium", createdBy: user2Id },
      ]);
    });

    it("should get all tasks for authenticated user", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
      response.body.data.tasks.forEach((task: any) => {
        expect(task.createdBy.toString()).toBe(user1Id);
      });
    });

    it("should not get tasks without authentication", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Access denied. No token provided.");
    });

    it("should get all tasks with pagination for authenticated user", async () => {
      const response = await request(app)
        .get("/api/tasks?page=1&limit=1")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.length).toBe(1);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.totalItems).toBe(2);
      expect(response.body.data.pagination.current).toBe(1);
    });

    it("should filter tasks by completion status", async () => {
      const response = await request(app)
        .get("/api/tasks?completed=true")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.length).toBe(1);
      expect(response.body.data.tasks[0].completed).toBe(true);
    });

    it("should filter tasks by priority", async () => {
      const response = await request(app)
        .get("/api/tasks?priority=high")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.length).toBe(1);
      expect(response.body.data.tasks[0].priority).toBe("high");
    });

    it("should give query validation error", async () => {
      const response = await request(app)
        .get("/api/tasks?priority=higher&completed=done")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid query parameters");
    });

    it("should support pagination parameters", async () => {
      // Add more tasks for pagination test
      await Task.create({ title: "Task 4", completed: false, priority: "low", createdBy: user1Id });
      await Task.create({ title: "Task 5", completed: false, priority: "medium", createdBy: user1Id });

      const response = await request(app)
        .get("/api/tasks?limit=2&page=2")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.current).toBe(2);
      expect(response.body.data.pagination.count).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.totalItems).toBeGreaterThanOrEqual(4);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    let user1TaskId: string;
    let user2TaskId: string;

    beforeEach(async () => {
      const task1 = await Task.create({
        title: "User1 Task",
        createdBy: user1Id,
      }) as any;
      const task2 = await Task.create({
        title: "User2 Task",
        createdBy: user2Id,
      }) as any;

      user1TaskId = task1._id.toString();
      user2TaskId = task2._id.toString();
    });

    it("should update own task", async () => {
      const updateData = { title: "Updated User1 Task" };

      const response = await request(app)
        .put(`/api/tasks/${user1TaskId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it("should not update other user's task", async () => {
      const updateData = { title: "Trying to update" };

      const response = await request(app)
        .put(`/api/tasks/${user2TaskId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Task not found or you do not have permission to update it"
      );
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .put(`/api/tasks/${user1TaskId}`)
        .send({ title: "Updated" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: "Updated" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const response = await request(app)
        .put(`/api/tasks/${user1TaskId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: "" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });

    it("should return validation error for invalid params", async () => {
      const response = await request(app)
        .put(`/api/tasks/invalid-id`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: "Updated title" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid parameters");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    let user1TaskId: string;
    let user2TaskId: string;

    beforeEach(async () => {
      const task1 = await Task.create({
        title: "User1 Task",
        createdBy: user1Id,
      }) as any;
      const task2 = await Task.create({
        title: "User2 Task",
        createdBy: user2Id,
      }) as any;

      user1TaskId = task1._id.toString();
      user2TaskId = task2._id.toString();
    });

    it("should delete own task", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${user2TaskId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Task deleted successfully");

      const deletedTask = await Task.findById(user2TaskId);
      expect(deletedTask).toBeNull();
    });

    it("should not delete other user's task", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${user1TaskId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Task not found or you do not have permission to delete it"
      );

      const task = await Task.findById(user1TaskId);
      expect(task).not.toBeNull();
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${user1TaskId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid params", async () => {
      const response = await request(app)
        .delete(`/api/tasks/invalid-id`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid parameters");
    });
  });

  describe("GET /api/tasks/:id", () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({
        title: "Test Task",
        description: "Test Description",
        createdBy: user2Id,
      }) as any;
      taskId = task._id.toString();
    });

    it("should get task by ID", async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Test Task");
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Task not found");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/tasks/invalid-id")
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid parameters");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(401);
      expect(response.body.success).toBe(false);
    });
  });
});
