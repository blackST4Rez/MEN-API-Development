import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    let mongoURI: string | undefined;
    
    // Try to read the .env file directly to get the MongoDB connection string
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      // Look for MongoDB connection string in the .env file
      for (const line of lines) {
        if (line.trim() && !line.trim().startsWith('#') && 
            (line.includes('mongodb') || line.includes('cluster'))) {
          mongoURI = line.trim();
          console.log("Found MongoDB connection string in .env file");
          break;
        }
      }
    }
    
    // If not found in .env file, check environment variables
    if (!mongoURI) {
      mongoURI = process.env.MONGODB_URI;
    }
    
    // If still not found, use local MongoDB
    if (!mongoURI) {
      mongoURI = "mongodb://localhost:27017/taskapp";
      console.log("Using local MongoDB:", mongoURI);
    }
    
    // Clean up the connection string (remove comments, etc.)
    mongoURI = mongoURI.replace(/#.*$/, '').trim();
    
    console.log("Connecting to MongoDB with:", mongoURI);
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("Please make sure:");
    console.log("1. Your MongoDB Atlas cluster is running");
    console.log("2. Your IP address is whitelisted in MongoDB Atlas");
    console.log("3. The connection string is correct");
    process.exit(1);
  }
};
