const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");
const { rateLimit } = require("express-rate-limit");
const { verifyToken } = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { isValidUUID2 } = require("../config/validation");
const knex = require("../db/knex");
const generateId = require("../config/generateId");
const { safeJSON } = require("../config/helpers");

const ALLOWED_CATEGORIES = [
  "waec",
  "stadium",
  "university",
  "cinema",
  "security",
  "bus",
];
let today = moment();

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await knex("categories")
      .select("*")
      .where("active", 1)
      .orderBy("created_at", "desc");

    const modifiedCategories = categories.map((category) => {
      const details = JSON.parse(category?.details);
      const date = moment(details?.date).add(12, "hours");

      if (
        ["cinema", "stadium", "bus"].includes(category?.category) &&
        today.isAfter(date)
      ) {
        return;
      } else {
        return {
          ...category,
          details,
        };
      }
    });

    res.status(200).json(_.compact(modifiedCategories));
  }),
);

//@GET Get all tickets
router.get(
  "/tickets",
  verifyToken,
  asyncHandler(async (req, res) => {
    const category = req?.query?.category;
    let categories = [];

    if (category) {
      categories = await knex("categories")
        .select("*")
        .where({ type: category, active: 1 })
        .orderBy("created_at", "desc");
    } else {
      categories = await knex("categories")
        .select("*")
        .where("active", 1)
        .andWhere("type", "IN", ["bus", "cinema", "stadium"])
        .orderBy("created_at", "desc");
    }

    const modifiedCategories = categories.map((category) => {
      const details = safeJSON(category?.details);

      return {
        ...category,
        details,
      };
    });

    res.status(200).json(_.compact(modifiedCategories));
  }),
);

//@GET Get Ticket by ID
router.get(
  "/tickets/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const category = await knex("categories")
      .select("*")
      .where({ id: id, active: 1 })
      .orderBy("created_at", "desc")
      .first();

    if (_.isEmpty(category)) {
      return res.status(200).json({});
    }

    const details = safeJSON(category?.details);

    res.status(200).json({
      ...category,
      details,
    });
  }),
);

router.get(
  "/main",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json("Missing Category");
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json("Unknown Category");
    }

    const categories = await knex("categories")
      .where("type", category)
      .select("*")
      .orderBy("created_at", "desc");

    const modifiedCategories = categories.map((category) => {
      return {
        ...category,
        createdAt: category.created_at,
        details: safeJSON(category?.details),
      };
    });

    // console.log(modifiedCategories);

    res.status(200).json(modifiedCategories);
  }),
);

router.get(
  "/type",
  asyncHandler(async (req, res) => {
    const { type, page = 1 } = req.query;

    // Validate type
    if (!type) {
      return res.status(400).json({ message: "Missing Category" });
    }

    if (!ALLOWED_CATEGORIES.includes(type)) {
      return res.status(400).json({ message: "Unknown Category" });
    }

    // Pagination setup
    const limit = 20;
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    // Base query
    let query = knex("categories")
      .select("*")
      .where({ type, active: 1 })
      .orderBy("created_at", "desc");

    if (req.query.page) {
      query = query.limit(limit).offset(offset);
    }

    const categories = await query;

    if (!categories.length) {
      return res.status(200).json([]);
    }

    const now = moment(); // cache current time once
    const restrictedTypes = new Set(["cinema", "stadium", "bus"]);

    const result = [];

    for (const category of categories) {
      let details = null;

      // Safe JSON parsing
      try {
        details = safeJSON(category.details);
      } catch (err) {
        continue; // skip invalid records
      }

      const date = details?.date ? moment(details.date).add(12, "hours") : null;

      // Filter expired categories
      if (date && restrictedTypes.has(category.type) && now.isAfter(date)) {
        continue;
      }

      result.push({
        ...category,
        details,
      });
    }

    return res.status(200).json(result);
  }),
);

//GET all categories
router.get(
  "/available",
  asyncHandler(async (req, res) => {
    // const categories = await Category.find({ active: true });

    const categories = await knex("categories")
      .select("*")
      .where({ active: 1 });

    if (_.isEmpty(categories)) {
      return res.status(200).json([]);
    }
    const modifiedCategories = categories.map((category) => {
      return {
        ...category,
        details: safeJSON(category?.details),
      };
    });

    res.status(200).json(modifiedCategories);
  }),
);

//GET all categories
router.get(
  "/all",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const categories = await knex("categories")
      .select("category")
      .orderBy("createdAt", "desc");

    const modifiedCategories = _.uniqBy(categories, "category");

    res.status(200).json(modifiedCategories);
  }),
);

//GET BUS BY DESTINATION
router.get(
  "/bus",
  asyncHandler(async (req, res) => {
    const { origin, destination } = req.query;

    // Normalize inputs
    const normalizedOrigin = typeof origin === "string" ? origin.trim() : "";

    const normalizedDestination =
      typeof destination === "string" ? destination.trim() : "";

    // Base query
    const query = knex("categories").where({
      "categories.type": "bus",
      "categories.active": 1,
    });

    // Search filters
    if (normalizedOrigin || normalizedDestination) {
      query.andWhere((builder) => {
        // Full route search
        if (normalizedOrigin && normalizedDestination) {
          const route = `${normalizedOrigin} to ${normalizedDestination}`;

          builder.orWhere("categories.name", "like", `%${route}%`);
        }

        // Origin search
        if (normalizedOrigin) {
          builder.orWhere("categories.name", "like", `%${normalizedOrigin}%`);
        }

        // Destination search
        if (normalizedDestination) {
          builder.orWhere(
            "categories.name",
            "like",
            `%${normalizedDestination}%`,
          );
        }
      });
    }

    // Single optimized query
    const buses = await query
      .leftJoin("vouchers", function () {
        this.on("vouchers.category_id", "=", "categories.id")
          .andOn("vouchers.active", "=", knex.raw("?", [1]))
          .andOn("vouchers.status", "=", knex.raw("?", ["new"]));
      })
      .groupBy("categories.id")
      .select(
        "categories.id",
        "categories.name",
        "categories.type",
        "categories.price",
        "categories.active",
        "categories.details",
        "categories.created_at",
        "categories.updated_at",
        knex.raw("COUNT(vouchers.id) as activeVouchers"),
      )
      .orderBy("categories.name", "asc");

    // Response transformation
    const formattedBuses = buses.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      active: item.active,
      price: item?.price || 0,
      details: safeJSON(item.details),
      created_at: item.created_at,
      updated_at: item.updated_at,
      activeVouchers: Number(item.activeVouchers || 0),
    }));

    return res.status(200).json(formattedBuses);
  }),
);

// router.get(
//   "/bus",
//   asyncHandler(async (req, res) => {
//     const { origin, destination } = req.query;

//     const voucherType = `${origin} to ${destination}`;

//     let bus;

//     if (!origin && !destination) {
//       bus = await knex("categories")
//         .select("*")
//         .where({ type: "bus", active: 1 });
//     } else {
//       bus = await knex("categories")
//         .where("name", "LIKE", `%${voucherType}%`)
//         .orWhere("name", "LIKE", `%${origin}`)
//         .orWhere("name", "LIKE", `${destination}%`)
//         .andWhere({ active: 1, type: "bus" })
//         .select("*");
//     }

//     if (_.isEmpty(bus)) {
//       return res.status(200).json([]);
//     }

//     const modifiedCategories = bus.map(async (item) => {
//       const activeVouchers = await knex("vouchers")
//         .where({
//           category_id: item?.id,
//           active: 1,
//           status: "new",
//         })
//         .count({ count: "*" });

//       return {
//         ...item,
//         details: safeJSON(item?.details),
//         activeVouchers: activeVouchers[0]?.count,
//       };
//     });

//     const buses = await Promise.all(modifiedCategories);

//     res.status(200).json(buses);
//   }),
// );

router.get(
  "/module/status",
  asyncHandler(async (req, res) => {
    const { title } = req.query;

    if (title) {
      const module = await knex("modules")
        .select("*")
        .where("title", title)
        .first();
      return res.status(200).json(module);
    }

    const modules = await knex("modules").select("*");
    res.status(200).json(modules);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const category = await knex("categories")
      .select("*")
      .where("id", id)
      .first();

    if (_.isEmpty(category)) {
      return res.status(200).json("No results match your search!");
    }

    res.status(200).json({
      ...category,
      details: JSON.parse(category.details),
    });
  }),
);

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const newCategory = req.body;

    if (_.isEmpty(newCategory)) {
      return res.status(400).json("Invalid Input Request!");
    }

    const modifiedCategory = {
      id: generateId(),
      ...newCategory,
      details: JSON.stringify(newCategory?.details),
    };

    if (newCategory.type === "waec") {
      const isCategoryExists = await knex("categories").where({
        name: newCategory.name,
        year: newCategory.year,
      });
      if (!_.isEmpty(isCategoryExists)) {
        return res.status(400).json("Category already exists!");
      }
    }

    const category = await knex("categories").insert(modifiedCategory);

    if (_.isEmpty(category)) {
      return res
        .status(200)
        .json(`Error occurred! Failed to add ${newCategory.name}`);
    }

    //logs
    await knex("activity_logs").insert({
      user_id: id,
      title: `Created a new ${modifiedCategory?.name} category.`,
      severity: "info",
    });

    res.status(201).send(`Category Saved!`);
  }),
);
router.post(
  "/module/status",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { active, title, message } = req.body;

    await knex("modules").where("title", title).update({
      message,
      active,
    });

    //logs
    await knex("activity_logs").insert({
      user_id: id,
      title: `Updated ${title} module status to ${
        active ? "active" : "disabled"
      }.`,
      severity: "warning",
    });

    res.status(201).send(`Changes updated!`);
  }),
);

router.put(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;

    if (_.isEmpty(req.body)) {
      return res.status(400).json("Invalid Input Request!");
    }

    const { id, details, ...rest } = req.body;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const newUpdatedCategory = {
      ...rest,
      details: JSON.stringify(details),
    };
    // delete newUpdatedCategory.id;

    const updatedCategory = await knex("categories")
      .where("id", id)
      .update(newUpdatedCategory);

    if (updatedCategory !== 1) {
      return res.status(404).json("Error Updating Category!");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: _id,
      title: `Modified ${newUpdatedCategory?.voucherType} category.`,
      severity: "info",
    });

    res.status(200).json("Changes saved!");
  }),
);

router.put(
  "/remove",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    if (_.isEmpty(req.body)) {
      return res.status(400).json("Invalid Input Request!");
    }
    const { id } = req.body;

    const deletedCategories = await knex("categories")
      .where("_id", "IN", id)
      .del();

    if (!deletedCategories) {
      return res.status(404).json("Error Updating Category!");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: `Deleted multiple categories.`,
      severity: "info",
    });

    res.status(200).json("Vouchers removed!");
  }),
);

router.patch(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id, active } = req.body;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const updatedCategory = await knex("categories")
      .where("_id", id)
      .update({ active });

    if (updatedCategory !== 1) {
      return res.status(404).json("Error Updating Category!");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: `${
        Boolean(active) === true
          ? "Activated a category!"
          : "Disabled a category!"
      }`,
      severity: "warning",
    });

    res
      .status(201)
      .json(
        Boolean(active) === true ? "Category enabled!" : "Category disabled!",
      );
  }),
);

router.delete(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;

    const id = req.query.id;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const deletedCategory = await knex("categories").where("_id", id).del();

    if (deletedCategory !== 1) {
      return res.status(404).json("Error Uemoving Category!");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: "Deleted a category!",
      severity: "error",
    });

    res.status(200).json("Category Removed!");
  }),
);

module.exports = router;
