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
      .orderBy("createdAt", "desc");

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
  })
);

//@GET Get all tickets
router.get(
  "/tickets",
  verifyToken,
  asyncHandler(async (req, res) => {
    const category = req?.query?.category
    let categories = [];
  

    if (category) {
      categories = await knex("categories")
        .select("*")
        .where({ category: category, active: 1, })
        .orderBy("createdAt", "desc");
    } else {

      categories = await knex("categories")
        .select("*")
        .where("active", 1)
        .andWhere('category', "IN", ['bus', 'cinema', 'stadium'])
        .orderBy("createdAt", "desc");
    }




    const modifiedCategories = categories.map((category) => {
      const details = JSON.parse(category?.details);
      // const date = moment(details?.date).add(12, "hours");

      // if (
      //   ["cinema", "stadium", "bus"].includes(category?.category) &&
      //   today.isAfter(date)
      // ) {
      //   return;
      // } else {
      return {
        ...category,
        details,
      };
      // }
    });

    res.status(200).json(_.compact(modifiedCategories));
  })
);


//@GET Get Ticket by ID
router.get(
  "/tickets/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id
    const category = await knex("categories")
      .select("*")
      .where({ _id: id, active: 1 })
      .orderBy("createdAt", "desc").limit(1)


    if (_.isEmpty(category)) {
      return res.status(200).json({})
    }


    const details = JSON.parse(category[0]?.details)

    res.status(200).json({
      ...category[0],
      details
    });
  })
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

    // const categories = await Category.find({ category }).sort({
    //   createdAt: -1,
    // });

    const categories = await knex("categories")
      .where("category", category)
      .select("*")
      .orderBy("createdAt", "desc");

    const modifiedCategories = categories.map((category) => {
      return {
        ...category,
        details: JSON.parse(category?.details),
      };
    });

    res.status(200).json(modifiedCategories);
  })
);

router.get(
  "/type",
  asyncHandler(async (req, res) => {
    const { category, page } = req.query;

    if (!category) {
      return res.status(400).json("Missing Category");
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json("Unknown Category");
    }

    if (page) {
      const _page = page || 1;
      const limit = _page * 10;

      const categories = await knex("categories")
        .select("*")
        .where({ category: category, active: 1 })
        .orderBy("createdAt", "desc")
        .limit(limit);

      if (_.isEmpty(categories)) {
        return res.status(200).json([]);
      }

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

      return res.status(200).json(_.compact(modifiedCategories));
    }

    const categories = await knex("categories")
      .select("*")
      .where({ category: category, active: 1 })
      .orderBy("createdAt", "desc");

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
  })
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
        details: JSON.parse(category?.details),
      };
    });

    res.status(200).json(modifiedCategories);
  })
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
  })
);


//GET BUS BY DESTINATION
router.get(
  "/bus",
  asyncHandler(async (req, res) => {
    const { origin, destination } = req.query;

    const voucherType = `${origin} to ${destination}`;

    let bus;

    if (!origin && !destination) {
      bus = await knex("categories")
        .select("*")
        .where({ category: "bus", active: 1 });
    } else {
      bus = await knex("categories")
        .where("voucherType", "LIKE", `%${voucherType}%`)
        .orWhere("voucherType", "LIKE", `%${origin}`)
        .orWhere("voucherType", "LIKE", `${destination}%`)
        .andWhere({ active: 1, category: "bus" })
        .select("*");
    }

    if (_.isEmpty(bus)) {
      return res.status(200).json([]);
    }

    const modifiedCategories = bus.map(async (item) => {
      const activeVouchers = await knex("vouchers")
        .where({
          category: item?._id,
          active: 1,
          status: "new",
        })
        .count({ count: "*" });

      return {
        ...item,
        details: JSON.parse(item?.details),
        activeVouchers: activeVouchers[0]?.count,
      };
    });

    const buses = await Promise.all(modifiedCategories);

    res.status(200).json(buses);
  })
);

router.get(
  "/module/status",
  asyncHandler(async (req, res) => {
    const { title } = req.query;

    if (title) {
      const module = await knex("modules")
        .select("*")
        .where("title", title)
        .limit(1);

      return res.status(200).json(module[0]);
    }

    const modules = await knex("modules").select("*");
    res.status(200).json(modules);
  })
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
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(category)) {
      return res.status(200).json("No results match your search!");
    }

    res.status(200).json({
      ...category[0],
      details: JSON.parse(category[0].details),
    });
  })
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
      _id: generateId(),
      ...newCategory,
      details: JSON.stringify(newCategory?.details),
    };

    // console.log(modifiedCategory)

    const category = await knex("categories").insert(modifiedCategory);

    if (_.isEmpty(category)) {
      return res
        .status(200)
        .json(`Error occurred! Failed to add ${newCategory.category}`);
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: `Created a new ${modifiedCategory?.category} category.`,
      severity: "info",
    });

    res.status(201).send(`Category Saved!`);
  })
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
      employee_id: id,
      title: `Updated ${title} module status to ${active ? "active" : "disabled"
        }.`,
      severity: "warning",
    });

    res.status(201).send(`Changes updated!`);
  })
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
      .where("_id", id)
      .update(newUpdatedCategory);

    if (updatedCategory !== 1) {
      return res.status(404).json("Error Updating Category!");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: `Modified ${newUpdatedCategory?.voucherType} category.`,
      severity: "info",
    });

    res.status(200).json("Changes saved!");
  })
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
  })
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
      title: `${Boolean(active) === true
        ? "Activated a category!"
        : "Disabled a category!"
        }`,
      severity: "warning",
    });

    res
      .status(201)
      .json(
        Boolean(active) === true ? "Category enabled!" : "Category disabled!"
      );
  })
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
  })
);

module.exports = router;
