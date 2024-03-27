const catchAsyncError = require("../middlewares/catchAsyncErr");
const Order = require("../models/orderModel");

const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/productModel");
//create new order - api/v1/order/new

exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    paymentInfo,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    paymentInfo,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user.id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

//Get single Order - api/v1/order/:id

exports.getOrderById = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(
      new ErrorHandler(`Order not founded with this id:${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    order,
  });
});

//get loggedin user order - /api/v1/myorders

exports.myorders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//Admin : get All Orders - api/v1/orders

exports.orders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalamount = 0;

  orders.forEach((order) => {
    totalamount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    totalamount,
    orders,
  });
});

//Admin Update Order/order  status  - api/v1/update:id
exports.updateOrders = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus == "Deliverd") {
    return next(new ErrorHandler("Order Has been already Deliverd!", 400));
  }

  //updataing each product item
  order.orderItems.forEach(async (orderItem) => {
    await updateStock(orderItem.product, orderItem.quantity);
  });

  order.orderStatus = req.body.orderStatus;
  order.deliveredAt = Date.now();
  await order.save();

  res.status(200).json({
    success: true,
  });
});

async function updateStock(productId, quantity) {
  const product = await Product.findById(productId);
  product.stock = product.stock - quantity;
  product.save({ validateBeforeSave: false });
}

//admin : delete order - api/v1/order/:id

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "order  not found",
    });
  }
  await order.deleteOne(); //
  res.status(200).json({
    success: true,
    message: "Order  was deleted",
  });
});
