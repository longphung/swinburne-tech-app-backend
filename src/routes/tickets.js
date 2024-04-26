import express from "express";
import passport from "passport";
import ticketSchema from "#src/models/ticketSchema.js"; // Import the Ticket model

const router = express.Router();

// Public route to display all tickets
router.get("/tickets", async (req, res) => {
    try {
        const tickets = await ticketSchema.find();
        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error retrieving tickets:", error);
        res.status(500).send("Error retrieving tickets");
    }
});

// Public route to get an individual ticket by ID
router.get("/tickets/:id", async (req, res) => {
    try {
        const ticket = await ticketSchema.findById(req.params.id);
        if (!ticket) {
            return res.status(404).send("Ticket not found");
        }
        res.status(200).json(ticket);
    } catch (error) {
        console.error("Error retrieving ticket:", error);
        res.status(500).send("Error retrieving ticket");
    }
});

// Protected route to create a new ticket
router.post("/tickets", passport.authenticate("bearer", { session: false }), async (req, res) => {
    try {
        const newTicket = new ticketSchema(req.body);
        await newTicket.save();
        res.status(201).send("New ticket created");
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).send("Error creating ticket");
    }
});

// Protected route to update an existing ticket by ID
router.put("/tickets/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
    try {
        const updatedTicket = await ticketSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTicket) {
            return res.status(404).send("Ticket not found");
        }
        res.status(200).send("Ticket updated");
    } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).send("Error updating ticket");
    }
});

// Protected route to delete an existing ticket by ID
router.delete("/tickets/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
    try {
        const deletedTicket = await ticketSchema.findByIdAndDelete(req.params.id);
        if (!deletedTicket) {
            return res.status(404).send("Ticket not found");
        }
        res.status(204).send("Ticket deleted");
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).send("Error deleting ticket");
    }
});

export default router;
