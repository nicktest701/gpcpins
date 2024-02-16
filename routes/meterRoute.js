const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const _ = require('lodash');
const { randomUUID } = require('crypto');

//model

const { isValidUUID2 } = require('../config/validation');

const knex = require('../db/knex');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const meterNo = req.query?.meterNo;

    if (meterNo) {
      const meter = await knex('meters')
        .select('*')
        .where('number', meterNo)
        .limit(1);

      return res.status(200).json(meter[0]);
    }

    // const meters = await Meter.find({});
    const meters = await knex('meters').select('*');
    res.status(200).json(meters);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidUUID2(id)) {
      return res.status(400).json('Invalid Request ID!');
    }

    const meter = await knex('meters').select('*').where('_id', id).limit(1);

    res.status(200).json(meter[0]);
  })
);
router.get(
  '/user/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(400).json('Invalid Request ID!');
    }

    const meters = await knex('meters')
      .select('*')
      .where('user', id)
      .orderBy('createdAt', 'desc');

    res.status(200).json(meters);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const newMeter = req.body;

    const ifMeterExists = await knex('meters').where({
      number: newMeter?.number,
      user: newMeter.user,
    });

    if (!_.isEmpty(ifMeterExists)) {
      return res.status(404).json('Meter already exist!.');
    }

    const meter = await knex('meters').insert({
      _id: randomUUID(),
      ...newMeter,
    });

    if (_.isEmpty(meter)) {
      return res.status(400).json('Error saving meter information!');
    }

    res.status(201).json('Meter saved!');
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const { _id, ...rest } = req.body;

    if (!isValidUUID2(_id)) {
      return res.status(400).json('Invalid Request!');
    }

    const meter = await knex('meters').where('_id', _id).update(rest);

    if (meter !== 1) {
      return res.status(404).json('Error updating meter information!');
    }
    res.status(201).json('Meter info updated successfully!!!');
  })
);

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!isValidUUID2(id)) {
      return res.status(400).json('Invalid Request!');
    }

    const meter = await knex('meters').where('_id', id).del();

    if (meter !== 1) {
      return res.status(404).json('Error removing meter!');
    }
    res.status(200).json('Meter removed!');
  })
);

module.exports = router;
