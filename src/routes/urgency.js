import express from "express";
import urgencySchema from "#src/models/urgencySchema.js";
const router = express.Router();

// Public route to display all urgencies
router.get("/urgencies", async (req, res) => {
    try {
        const urgencies = await urgencySchema .find();
        res.status(200).json(urgencies);
    } catch (error) {
        console.error("Error retrieving urgencies:", error);
        res.status(500).send("Error retrieving urgencies");
    }
});

// Public route to get an individual urgency by ID
router.get("/urgencies/:id", async (req, res) => {
    try {
        const urgency = await urgencySchema .findById(req.params.id);
        if (!urgency) {
            return res.status(404).send("Urgency not found");
        }
        res.status(200).json(urgency);
    } catch (error) {
        console.error("Error retrieving urgency:", error);
        res.status(500).send("Error retrieving urgency");
    }
});

// Protected route to create a new urgency
router.post("/urgencies", async (req, res) => {
    try {
        const newUrgency = new urgencySchema (req.body);
        await newUrgency.save();
        res.status(201).send("New urgency created");
    } catch (error) {
        console.error("Error creating urgency:", error);
        res.status(500).send("Error creating urgency");
    }
});

// Protected route to update an existing urgency by ID
router.put("/urgencies/:id", async (req, res) => {
    try {
        const updatedUrgency = await urgencySchema .findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUrgency) {
            return res.status(404).send("Urgency not found");
        }
        res.status(200).send("Urgency updated");
    } catch (error) {
        console.error("Error updating urgency:", error);
        res.status(500).send("Error updating urgency");
    }
});

// Protected route to delete an existing urgency by ID
router.delete("/urgencies/:id", async (req, res) => {
    try {
        const deletedUrgency = await urgencySchema .findByIdAndDelete(req.params.id);
        if (!deletedUrgency) {
            return res.status(404).send("Urgency not found");
        }
        res.status(204).send("Urgency deleted");
    } catch (error) {
        console.error("Error deleting urgency:", error);
        res.status(500).send("Error deleting urgency");
    }
});

export default router;
