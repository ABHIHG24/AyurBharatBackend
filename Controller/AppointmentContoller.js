const Appointment = require("../model/Appointment");
const sendEmail = require("../utils/email");
const ErrorHandler = require("../utils/errorHandler");

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json({ success: true, message: " all data", appointments });
  } catch (error) {
    // console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { name, email, phone, date, message } = req.body;
    const newAppointment = new Appointment({
      name,
      email,
      phone,
      date,
      message,
    });
    const savedAppointment = await newAppointment.save();

    const appointmentConfirmation = `Thank you, we have received your request. We will contact you soon.`;

    await sendEmail({
      to: email,
      subject: "Ayur Bharat",
      text: appointmentConfirmation,
    });

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      savedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

module.exports = { createAppointment, getAllAppointments };
