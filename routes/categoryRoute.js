const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");
const { randomUUID } = require("crypto");
const { rateLimit } = require("express-rate-limit");
const { verifyToken } = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { isValidUUID2 } = require("../config/validation");
const knex = require("../db/knex");
const sendMoney = require("../config/sendMoney");

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
      console.log(date);

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

//GET all categories
// @route   GET api/categories/money
router.get(
  "/money",
  asyncHandler(async (req, res) => {
    const payment = {
      name: "Nana Akwasi",
      phonenumber: "+233543772591",
      email: "nicktest701@gmail.com",
      amount: 0.1,
      provider: "mtn-gh",
      reference: "MTN1234567890",
    };

    try {
      const response = await sendMoney(payment, "p");

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).send({ error: error?.message });
    }
  })
);

//GET BUS BY DESTINATION
router.get(
  "/bus",
  asyncHandler(async (req, res) => {
    const { voucherType } = req.query;

    let bus;

    if (!voucherType) {
      bus = await knex("categories")
        .select("*")
        .where({ category: "bus", active: 1 });
    } else {
      bus = await knex("categories")
        .where({ active: 1, category: "bus" })
        .andWhere("voucherType", "LIKE", `%${voucherType}%`)
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
        activeVouchers,
      };
    });

    const buses = await Promise.all(modifiedCategories);

    res.status(200).json(buses);
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
    const newCategory = req.body;

    if (_.isEmpty(newCategory)) {
      return res.status(400).json("Invalid Input Request!");
    }

    const modifiedCategory = {
      _id: randomUUID(),
      ...newCategory,
      details: JSON.stringify(newCategory?.details),
    };

    const category = await knex("categories").insert(modifiedCategory);

    if (_.isEmpty(category)) {
      return res
        .status(200)
        .json(`Error occured! Failed to add ${newCategory.category}`);
    }

    res.status(201).send(`Category Saved!`);
  })
);

router.put(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
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

    res.status(200).json("Changes saved!");
  })
);

router.put(
  "/remove",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
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

    res.status(200).json("Vouchers removed!");
  })
);

router.patch(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
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
    const id = req.query.id;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const deletedCategory = await knex("categories").where("_id", id).del();

    if (deletedCategory !== 1) {
      return res.status(404).json("Error Uemoving Category!");
    }

    res.status(200).json("Category Removed!");
  })
);

module.exports = router;
