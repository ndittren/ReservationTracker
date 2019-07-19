var express = require('express');
var router = express.Router();
const {db, Reservations} = require('../db/models/index');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

/* GET reservations listing. */
router.get('/', async (req, res, next) => {
  const todaysDate = Date.now();
  const currentHour = new Date().getHours() % 12;
  const reservations = await Reservations.findAll({
    where: {
      date: {[Op.gte]: todaysDate},
      time: {[Op.gte]: currentHour}
    }
  });

  const updatedReservations = reservations.map(reservation => {
    const newReservation = {
      id: reservation._id,
      name: reservation.name,
      time: reservation.time - 12 + `pm`,
      date: moment(reservation.date).format('L')
    };

    return newReservation;
  });

  res.json(updatedReservations);
});

module.exports = router;
