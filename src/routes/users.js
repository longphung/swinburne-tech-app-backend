import express from "express";
import passport from "passport";
import { USERS_ROLE } from "#models/users.js";
import { getUser, getUsersList, updateUser } from "#src/services/users.js";
import logger from "#src/logger.js";
import Joi from "joi";

const router = express.Router();

router.get;

/**
 * Get information about the user
 * @swagger
 * /users/{id}:
 *  get:
 *    description: Get information about the user
 *    responses:
 *      200:
 *        description: User information
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
    _order: Joi.string().valid("ASC", "DESC").required(),
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
    res.send(users);
  } catch (e) {
    logger.error(e.message);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
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
    role: Joi.array().items(Joi.string().valid(USERS_ROLE.CUSTOMER, USERS_ROLE.TECHNICIAN)),
    name: Joi.string(),
    address: Joi.string(),
    phone: Joi.string().pattern(/[0-9]+/),
    email: Joi.string().email(),
    emailVerified: Joi.boolean(),
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

export default router;
