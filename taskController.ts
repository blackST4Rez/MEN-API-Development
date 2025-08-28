import { Request, Response, RequestHandler } from "express";
import { Task } from "../models/Task";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
} from "../schemas/taskSchemas";

export const getTasks: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      completed,
      priority,
      page = "1",
      limit = "10",
    } = req.query as TaskQuery;

    const filter: any = { createdBy: userId };
    if (completed !== undefined) {
      filter.completed = completed === "true";
    }
    if (priority) {
      filter.priority = priority;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: tasks.length,
          totalItems: total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createTask: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const taskData: CreateTaskInput = req.body;
    const userId = (req as any).user?._id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const task = new Task({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      createdBy: userId,
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateTask: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updateData: UpdateTaskInput = req.body;
    const userId = (req as any).user?._id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId },
      {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to update it",
      });
      return;
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTaskById: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return; // Important: return after sending response
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteTask: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: (req as any).user._id,
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to delete it",
      });
      return;
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
