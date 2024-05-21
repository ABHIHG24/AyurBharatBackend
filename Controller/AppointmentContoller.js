const Appointment = require("../model/Appointment");
const sendEmail = require("../utils/email");
const ErrorHandler = require("../utils/errorHandler");

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json({ success: true, message: "allData", appointments });
  } catch (error) {
    // console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Checked } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { appointmentStatus: Checked },
      { new: true }
    );

    if (!updatedAppointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      updatedAppointment,
    });
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
      deletedAppointment,
    });
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
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

    const appointmentConfirmation = `Thank you, we have received your request. your apppintment as been booked on ${date}.`;

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

module.exports = {
  createAppointment,
  getAllAppointments,
  deleteAppointment,
  updateAppointment,
};
