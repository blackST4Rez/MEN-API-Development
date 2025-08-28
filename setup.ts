import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

export const createTestUser = async () => {
  const user = new User({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
  await user.save();

  const token = generateToken(user._id.toString());
  return { user, token };
};

export const createTestUser2 = async () => {
  const user = new User({
    name: "Test User 2",
    email: "test2@example.com",
    password: "password123",
  });
  await user.save();

  const token = generateToken(user._id.toString());
  return { user, token };
};
