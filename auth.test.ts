import request from "supertest";
import createTestApp from "./test-app";
import { User } from "../models/User";

const app = createTestApp();

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it("should not register user with duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      await User.create(userData);

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const badUserData = {
        name: "J",
        email: "john",
        password: "pass",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(badUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
      await user.save();
    });

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it("should not login with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const badUserData = {
        email: "john",
        password: "",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(badUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });
  });

  describe("Access Protected Routes Without Token", () => {
    it("should deny access to protected route without token", async () => {
      const response = await request(app)
        .get("/api/tasks/test-auth") // Example protected route
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Access denied. No token provided.");
    });
  });
});
