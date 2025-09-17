import express from "express";
import { upload } from "../multer.js";
import { login, logout, signup, updateUserInfo, updateUserAvatar, addUserAddress, deleteUserAddress, updateUserPassword } from "../controllers/userController.js";
import { useractivation } from "../utils/token.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", upload.single("file"), signup);
userRouter.post("/login", login);
userRouter.get("/logout", logout);

userRouter.get("/get-user", isAuthenticated, (req, res) => {
  res.json({ user: req.user }); 
});

userRouter.put("/update-user", isAuthenticated, updateUserInfo);
userRouter.put("/update-avatar", upload.single("file"), isAuthenticated, updateUserAvatar);

userRouter.post('/add-user-address', isAuthenticated, addUserAddress);
userRouter.delete('/delete-user-address/:id', isAuthenticated, deleteUserAddress);

userRouter.put("/update-password", isAuthenticated, updateUserPassword);

userRouter.get("/activation/:token", useractivation);

export default userRouter;