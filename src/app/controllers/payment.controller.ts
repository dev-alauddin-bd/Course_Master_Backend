//  ====================
//   Payment Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { paymentService } from "../services/payment.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { enrollValidation } from "../validations/enroll.validation";

// ============================== CREATE Checkout ==============================
const createCheckout = catchAsyncHandler(async (req: Request, res: Response) => {
  const validated = enrollValidation.parse(req.body);
  const userId = req.user!.id;
  const result = await paymentService.createCheckoutSession(userId, validated.courseId);
  sendResponse(res, 201, "Checkout session created", result);
});

const paymentSuccess = async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (sessionId) {
    await paymentService.verifyPaymentAndEnroll(sessionId);
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0fdf4; color: #166534; text-align: center; }
        .container { background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 500px; width: 90%; }
        h1 { margin-top: 0; color: #15803d; font-size: 2rem; }
        p { margin-bottom: 2rem; color: #4b5563; line-height: 1.5; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; background-color: #16a34a; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
        .btn:hover { background-color: #15803d; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your payment was processed successfully, and you are now enrolled in the course.</p>
        <a href="${frontendUrl}/dashboard/student/my-courses" class="btn">Go to My Courses</a>
      </div>
    </body>
    </html>
  `;
  res.send(html);
};

const paymentCancel = (req: Request, res: Response) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Cancelled</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fffbeb; color: #b45309; text-align: center; }
        .container { background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 500px; width: 90%; }
        h1 { margin-top: 0; color: #d97706; font-size: 2rem; }
        p { margin-bottom: 2rem; color: #4b5563; line-height: 1.5; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; background-color: #d97706; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
        .btn:hover { background-color: #b45309; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">⚠️</div>
        <h1>Payment Cancelled</h1>
        <p>You cancelled the payment process. Your enrollment has not been completed.</p>
        <a href="${frontendUrl}" class="btn">Return to Home</a>
      </div>
    </body>
    </html>
  `;
  res.send(html);
};

const paymentFail = (req: Request, res: Response) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fef2f2; color: #b91c1c; text-align: center; }
        .container { background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 500px; width: 90%; }
        h1 { margin-top: 0; color: #dc2626; font-size: 2rem; }
        p { margin-bottom: 2rem; color: #4b5563; line-height: 1.5; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; background-color: #dc2626; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
        .btn:hover { background-color: #b91c1c; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">❌</div>
        <h1>Payment Failed</h1>
        <p>Something went wrong with your payment. Please try again.</p>
        <a href="${frontendUrl}" class="btn">Return to Home</a>
      </div>
    </body>
    </html>
  `;
  res.send(html);
};

const refundCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.body;
  const userId = req.user!.id;
  if (!courseId) {
    return sendResponse(res, 400, "courseId is required");
  }
  const result = await paymentService.refundCourse(userId, courseId);
  sendResponse(res, 200, "Refund processed", result);
});

export const paymentController: PaymentController = {
  createCheckout,
  paymentSuccess,
  paymentCancel,
  paymentFail,
  refundCourse,
};

type PaymentController = {
  createCheckout: RequestHandler;
  paymentSuccess: RequestHandler;
  paymentCancel: RequestHandler;
  paymentFail: RequestHandler;
  refundCourse: RequestHandler;
}