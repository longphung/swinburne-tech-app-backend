import express from "express";
import passport from "passport";
import { USERS_ROLE } from "#models/users.js";
import { deleteUser, getUser, getUsersList, updateUser } from "#src/services/users.js";
import logger from "#src/logger.js";
import Joi from "joi";

const router = express.Router();

/**
 * Get information about the user
 * @swagger
 * /users/{id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    tags: ["Users"]
 *    description: Get information about the user
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: User ID
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: User information
 *      403:
 *        description: Forbidden
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.get(
  "/:id",
  passport.authenticate("bearer", {
    session: false,
  }),
  async (req, res) => {
    const { id } = req.params;
    if (req.user.userId !== id && !req.user.role.includes(USERS_ROLE.ADMIN)) {
      return res.status(403).send();
    }
    try {
      const user = await getUser(id);
      res.send(user);
    } catch (e) {
      if (e.message === "User not found") {
        return res.status(404).send();
      }
      logger.error(e.message);
      res.status(500).send();
    }
  },
);
/**
 * @swagger
 * /users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: ["Users"]
 *     summary: Get list of users
 *     description: Retrieve a list of users
 *     parameters:
 *       - in: query
 *         name: _start
 *         schema:
 *           type: integer
 *         required: true
 *         description: Starting index of the pagination
 *       - in: query
 *         name: _end
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ending index of the pagination
 *       - in: query
 *         name: _sort
 *         schema:
 *           type: string
 *         required: true
 *         description: Sorting parameter
 *       - in: query
 *         name: _order
 *         schema:
 *           type: string
 *         required: true
 *         description: Order of sorting (asc or desc)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Filter parameter
 *     responses:
 *       200:
 *         description: List of users
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.get("/", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
    return res.status(403).send();
  }
  const schema = Joi.object({
    // pagination
    _start: Joi.number().required(),
    _end: Joi.number().required(),
    // sorters
    _sort: Joi.string().required(),
    _order: Joi.string().valid("asc", "desc").required(),
    // filter
    q: Joi.string().default(""),
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).send({
      message: error.details[0].message,
    });
  }
  try {
    const users = await getUsersList(req.query);
    // Set x-total-count header
    res.set("x-total-count", users.totalDocs);
    res.send(users.docs);
  } catch (e) {
    logger.error(e.message);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags: ["Users"]
 *     summary: Update user information
 *     description: Update user information by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
 *               role:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [customer, technician]
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]+$"
 *               email:
 *                 type: string
 *                 format: email
 *               emailVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated user information
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.patch("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  const { id } = req.params;
  if (req.user.userId !== id && !req.user.role.includes(USERS_ROLE.ADMIN)) {
    return res.status(403).send("Forbidden");
  }
  const schema = Joi.object({
    username: Joi.string(),
    /**
     * Password must be at least 8 characters long
     * and contain at least one uppercase letter,
     * and one lowercase letter,
     * and one number,
     * and one special character
     */
    password: Joi.string()
      .min(8)
      .pattern(/[A-Z]+/, "uppercase")
      .pattern(/[a-z]+/, "lowercase")
      .pattern(/[0-9]+/, "number")
      .pattern(/[^A-Za-z0-9]+/, "special"),
    role: Joi.array().items(Joi.string().valid(USERS_ROLE.CUSTOMER, USERS_ROLE.TECHNICIAN, USERS_ROLE.ADMIN)),
    name: Joi.string(),
    address: Joi.string(),
    phone: Joi.string().pattern(/[0-9]+/),
    email: Joi.string().email(),
    emailVerified: Joi.boolean().custom((value, helpers) => {
      // Only allow emailVerified in the request if the user is an admin
      if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
        return helpers.error("forbidden");
      }
    })
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({
      message: error.details[0].message,
    });
  }
  try {
    const user = await updateUser(id, req.body);
    res.send(user);
  } catch (e) {
    if (e.message === "User not found") {
      return res.status(404).send();
    }
    logger.error(e.message);
    res.status(500).send();
  }
});

// TODO: Ideally we can schedule this deletion within 1 month
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: ["Users"]
 *     summary: Delete user
 *     description: Delete user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  const { id } = req.params;
  if (req.user.userId !== id && !req.user.role.includes(USERS_ROLE.ADMIN)) {
    return res.status(403).send("Forbidden");
  }
  try {
    const deletedUser = await deleteUser(id);
    res.status(204).send(`User ${deletedUser._id} deleted`);
  } catch (e) {
    if (e.message === "User not found") {
      return res.status(404).send();
    }
    logger.error(e.message);
    res.status(500).send();
  }
});

export default router;
