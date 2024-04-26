import express from "express";
import priorityTypeSchema from "./models/priorityTypeSchema.js"; // Import the PriorityType model

const router = express.Router();

// Public route to display all priority types
router.get("/priority-types", async (req, res) => {
    try {
        const priorityTypes = await priorityTypeSchema.find();
        res.status(200).json(priorityTypes);
    } catch (error) {
        console.error("Error retrieving priority types:", error);
        res.status(500).send("Error retrieving priority types");
    }
});

// Public route to get an individual priority type by ID
router.get("/priority-types/:id", async (req, res) => {
    try {
        const priorityType = await priorityTypeSchema.findById(req.params.id);
        if (!priorityType) {
            return res.status(404).send("Priority type not found");
        }
        res.status(200).json(priorityType);
    } catch (error) {
        console.error("Error retrieving priority type:", error);
        res.status(500).send("Error retrieving priority type");
    }
});

// Protected route to create a new priority type
router.post("/priority-types", async (req, res) => {
    try {
        const newPriorityType = new priorityTypeSchema(req.body);
        await newPriorityType.save();
        res.status(201).send("New priority type created");
    } catch (error) {
        console.error("Error creating priority type:", error);
        res.status(500).send("Error creating priority type");
    }
});

// Protected route to update an existing priority type by ID
router.put("/priority-types/:id", async (req, res) => {
    try {
        const updatedPriorityType = await priorityTypeSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPriorityType) {
            return res.status(404).send("Priority type not found");
        }
        res.status(200).send("Priority type updated");
    } catch (error) {
        console.error("Error updating priority type:", error);
        res.status(500).send("Error updating priority type");
    }
});

// Protected route to delete an existing priority type by ID
router.delete("/priority-types/:id", async (req, res) => {
    try {
        const deletedPriorityType = await priorityTypeSchema.findByIdAndDelete(req.params.id);
        if (!deletedPriorityType) {
            return res.status(404).send("Priority type not found");
        }
        res.status(204).send("Priority type deleted");
    } catch (error) {
        console.error("Error deleting priority type:", error);
        res.status(500).send("Error deleting priority type");
    }
});

export default router;
