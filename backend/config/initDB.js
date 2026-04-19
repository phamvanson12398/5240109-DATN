import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const initDB = async () => {
  try {
    const modelsPath = path.join(process.cwd(), "models");
    const files = fs.readdirSync(modelsPath);

    for (const file of files) {
      if (!file.endsWith(".js")) continue;

      // import model
      const module = await import(`../models/${file}`);

      // lấy tất cả export (phòng khi export nhiều)
      const exports = Object.values(module);

      for (const item of exports) {
        // chỉ xử lý những cái là model mongoose
        if (item?.prototype instanceof mongoose.Model || item?.modelName) {
          const model = item;
          const collectionName = model.collection.name;

          // kiểm tra collection tồn tại
          const exists = await mongoose.connection.db
            .listCollections({ name: collectionName })
            .toArray();

          if (exists.length === 0) {
            await mongoose.connection.createCollection(collectionName);
            console.log(`✅ Created: ${collectionName}`);
          } else {
            console.log(`⚡ Exists: ${collectionName}`);
          }

          await model.syncIndexes();
          console.log(`🔧 Synced indexes: ${collectionName}`);
        }
      }
    }

    console.log("🎉 Init DB done");

  } catch (error) {
    console.error("❌ InitDB error:", error);
  }
};