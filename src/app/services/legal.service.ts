//  ====================
//      Legal Service
// ====================

import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

// ============================== CREATE OR UPDATE DOCUMENT ==============================
const createOrUpdateLegalDocument = async (payload: { slug: string; title: string; content: string }) => {
  return await prisma.legalDocument.upsert({
    where: { slug: payload.slug },
    update: {
      title: payload.title,
      content: payload.content,
    },
    create: {
      slug: payload.slug,
      title: payload.title,
      content: payload.content,
    },
  });
};


// ============================== GET DOCUMENT BY SLUG ==============================
const getLegalDocumentBySlug = async (slug: string) => {
  const document = await prisma.legalDocument.findUnique({
    where: { slug },
  });
  
  if (!document) {
     throw new CustomAppError(404, `Legal document with slug '${slug}' not found`);
  }

  return document;
};

// ============================== GET ALL DOCUMENTS ==============================
const getAllLegalDocuments = async () => {
  return await prisma.legalDocument.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

export const legalService = {
  createOrUpdateLegalDocument,
  getLegalDocumentBySlug,
  getAllLegalDocuments,
};
