const express = require("express");
const router = express.Router();
const appointmentController = require("../Controller/AppointmentContoller");

router
  .get("/", appointmentController.getAllAppointments)
  .post("/", appointmentController.createAppointment);

module.exports = router;
