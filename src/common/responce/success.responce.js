const successResponce = ({
  res,
  message = "success",
  status = 200,
  data = null,
} = {}) => {
  res.status(status).json({ status, message, data });
};

export default successResponce;
