import express from "express";
import notificationSchema from "#src/models/notificationSchema.js"; 

const router = express.Router();

// Public route to display all notifications
router.get("/notifications", async (req, res) => {
    try {
        const notifications = await notificationSchema.find();
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error retrieving notifications:", error);
        res.status(500).send("Error retrieving notifications");
    }
});

// Public route to get an individual notification by ID
router.get("/notifications/:id", async (req, res) => {
    try {
        const notification = await notificationSchema.findById(req.params.id);
        if (!notification) {
            return res.status(404).send("Notification not found");
        }
        res.status(200).json(notification);
    } catch (error) {
        console.error("Error retrieving notification:", error);
        res.status(500).send("Error retrieving notification");
    }
});

// Protected route to create a new notification
router.post("/notifications", async (req, res) => {
    try {
        const newNotification = new notificationSchema(req.body);
        await newNotification.save();
        res.status(201).send("New notification created");
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).send("Error creating notification");
    }
});

// Protected route to update an existing notification by ID
router.put("/notifications/:id", async (req, res) => {
    try {
        const updatedNotification = await notificationSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedNotification) {
            return res.status(404).send("Notification not found");
        }
        res.status(200).send("Notification updated");
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).send("Error updating notification");
    }
});

// Protected route to delete an existing notification by ID
router.delete("/notifications/:id", async (req, res) => {
    try {
        const deletedNotification = await notificationSchema.findByIdAndDelete(req.params.id);
        if (!deletedNotification) {
            return res.status(404).send("Notification not found");
        }
        res.status(204).send("Notification deleted");
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).send("Error deleting notification");
    }
});

// Route to get job assignment notifications
router.get("/notifications/job_assignment", async (req, res) => {
    try {
        const notifications = await notificationSchema.find({ notificationType: "job_assignment" });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error retrieving job assignment notifications:", error);
        res.status(500).send("Error retrieving job assignment notifications");
    }
});

// Route to get upcoming SLA notifications
router.get("/notifications/upcoming_sla", async (req, res) => {
    try {
        const notifications = await notificationSchema.find({ notificationType: "upcoming_sla" });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error retrieving upcoming SLA notifications:", error);
        res.status(500).send("Error retrieving upcoming SLA notifications");
    }
});

// Route to get missed SLA notifications
router.get("/notifications/missed_sla", async (req, res) => {
    try {
        const notifications = await notificationSchema.find({ notificationType: "missed_sla" });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error retrieving missed SLA notifications:", error);
        res.status(500).send("Error retrieving missed SLA notifications");
    }
});
export default router;
