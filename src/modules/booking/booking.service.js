import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../common/responce/error.responce.js";
import { bookingModel } from "../../database/models/message.model.js";

export const getMyBookings = async (userId, search, sort) => {
  const filter = { userId };
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }
  const bookings = await bookingModel
    .find(filter)
    .sort(sort ? { [sort]: 1 } : {});
  return { message: "success", data: bookings };
};

export const getBookingById = async (id, userId) => {
  const booking = await bookingModel.findById(id);
  if (!booking) {
    NotFoundException({ message: "Booking not found" });
  }
  if (booking.userId.toString() !== userId) {
    ForbiddenException({ message: "Forbidden" });
  }
  return { message: "success", data: booking };
};

export const createBooking = async (data) => {
  const { userId, title, bookingDate } = data;

  if (!title || !bookingDate) {
    BadRequestException({ message: "title and bookingDate are required" });
  }

  if (new Date(bookingDate) < new Date()) {
    BadRequestException({ message: "Booking date cannot be in the past" });
  }

  const booking = await bookingModel.create({ userId, title, bookingDate });
  return { message: "booking created successfully", data: booking };
};

export const cancelBooking = async (id, userId) => {
  const booking = await bookingModel.findById(id);
  if (!booking) {
    NotFoundException({ message: "Booking not found" });
  }
  if (booking.userId.toString() !== userId) {
    ForbiddenException({ message: "Forbidden" });
  }
  if (booking.status === "canceled") {
    BadRequestException({ message: "Booking is already canceled" });
  }
  booking.status = "canceled";
  await booking.save();
  return { message: "booking canceled successfully", data: booking };
};

export const updateBooking = async (id, data, userId) => {
  const { title, bookingDate, status } = data;
  const booking = await bookingModel.findById(id);
  if (!booking) {
    NotFoundException({ message: "Booking not found" });
  }
  if (booking.userId.toString() !== userId) {
    ForbiddenException({ message: "Forbidden" });
  }
  if (booking.status === "canceled") {
    BadRequestException({ message: "Booking is already canceled" });
  }
  if (bookingDate) {
    if (new Date(bookingDate) < new Date()) {
      BadRequestException({ message: "Booking date cannot be in the past" });
    }
    booking.bookingDate = bookingDate;
  }
  if (title) booking.title = title;
  if (status) booking.status = status;

  await booking.save();
  return { message: "booking updated successfully", data: booking };
};
