const express = require("express");
const router = express.Router();
const appointmentController = require("../Controller/AppointmentContoller");

router
  .get("/", appointmentController.getAllAppointments)
  .post("/", appointmentController.createAppointment)
  .put("/:id", appointmentController.updateAppointment)
  .delete("/:id", appointmentController.deleteAppointment);

module.exports = router;
