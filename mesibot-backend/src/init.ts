import { connectDB } from "./clients/mongo";

export const initServerPrerequisites = async () => {
  await connectDB();
};
