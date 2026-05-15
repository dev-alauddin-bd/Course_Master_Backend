//  ====================
//      Legal Routes
// ====================

import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";
import { legalController } from "../controllers/legal.controller";

const router = Router();

// ============================== PUBLIC ROUTES ==============================
router.get("/:slug", legalController.getLegalDocumentBySlug);
router.get("/", legalController.getAllLegalDocuments);

// ============================== ADMIN ROUTES ==============================
router.post(
  "/",
  protect,
  authorize(UserRole.ADMIN),
  legalController.createOrUpdateLegalDocument
);

export const legalRouter: Router = router;
