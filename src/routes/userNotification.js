import express from "express";
import passport from "passport";
import UserNotificationSchema from "#src/models/userNotificationSchema.js"; 

const router = express.Router();

// Public route to display all user notifications
router.get("/user-notifications", async (req, res) => {
    try {
        const userNotifications = await UserNotificationSchema.find();
        res.status(200).json(userNotifications);
    } catch (error) {
        console.error("Error retrieving user notifications:", error);
        res.status(500).send("Error retrieving user notifications");
    }
});

// Public route to get an individual user notification by ID
router.get("/user-notifications/:id", async (req, res) => {
    try {
        const userNotification = await UserNotificationSchema.findById(req.params.id);
        if (!userNotification) {
            return res.status(404).send("User notification not found");
        }
        res.status(200).json(userNotification);
    } catch (error) {
        console.error("Error retrieving user notification:", error);
        res.status(500).send("Error retrieving user notification");
    }
});

// Protected route to create a new user notification
router.post("/user-notifications", passport.authenticate("bearer", { session: false }), async (req, res) => {
    try {
        const newUserNotification = new UserNotificationSchema(req.body);
        await newUserNotification.save();
        res.status(201).send("New user notification created");
    } catch (error) {
        console.error("Error creating user notification:", error);
        res.status(500).send("Error creating user notification");
    }
});

// Protected route to update an existing user notification by ID
router.put("/user-notifications/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
    try {
        const updatedUserNotification = await UserNotificationSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUserNotification) {
            return res.status(404).send("User notification not found");
        }
        res.status(200).send("User notification updated");
    } catch (error) {
        console.error("Error updating user notification:", error);
        res.status(500).send("Error updating user notification");
    }
});

// Protected route to delete an existing user notification by ID
router.delete("/user-notifications/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
    try {
        const deletedUserNotification = await UserNotificationSchema.findByIdAndDelete(req.params.id);
        if (!deletedUserNotification) {
            return res.status(404).send("User notification not found");
        }
        res.status(204).send("User notification deleted");
    } catch (error) {
        console.error("Error deleting user notification:", error);
        res.status(500).send("Error deleting user notification");
    }
});

export default router;
