import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
} from "./booking.service.js";

const router = Router();

router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const result = await getMyBookings(
      req.user.id,
      req.query.search,
      req.query.sort,
    );
    res.status(200).json(result);
  }),
);

router.get(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const result = await getBookingById(req.params.id, req.user.id);
    res.status(200).json(result);
  }),
);

router.put(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const result = await updateBooking(req.params.id, req.body, req.user.id);
    res.status(200).json(result);
  }),
);

router.delete(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const result = await cancelBooking(req.params.id, req.user.id);
    res.status(200).json(result);
  }),
);

router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const result = await createBooking({ ...req.body, userId: req.user.id });
    res.status(201).json(result);
  }),
);

export default router;
