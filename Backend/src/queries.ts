import { PrismaClient } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";
import type { ParsedQs } from "qs";

const prisma = new PrismaClient();

interface TypedRequest<T> extends Request {
  body: T;
}

const parseNumbers = (
  numbs: string | ParsedQs | string[] | ParsedQs[] | undefined
): number[] | undefined => {
  return numbs && typeof numbs === "string"
    ? numbs.split(",").map((x) => parseInt(x))
    : undefined;
};

//Endpoint functions
export const root = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  response.json({ info: "All works fine!" });
};

export const getTypes = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const records = await prisma.types.findMany();
    response.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.categories.findMany();
    response.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getRecords = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const {
      contains,
      createdFrom,
      createdTo,
      editedFrom,
      editedTo,
      category,
      type,
    } = request.query;

    const parsedCategories = parseNumbers(category);
    const parsedTypes = parseNumbers(type);

    const records = await prisma.records.findMany({
      where: {
        AND: [
          { created: { gte: createdFrom?.toString() } },
          { created: { lte: createdTo?.toString() } },
          { edited: { gte: editedFrom?.toString() } },
          { edited: { lte: editedTo?.toString() } },
          {
            categories: {
              some: { id: { in: parsedCategories } },
            },
          },
          { type: { id: { in: parsedTypes } } },
          {
            OR: [
              { content: { contains: contains?.toString() } },
              { name: { contains: contains?.toString() } },
            ],
          },
        ],
      },
      include: {
        categories: {
          select: {
            id: true,
          },
        },
      },
    });
    response.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export const getRecord = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(request.params.id);
    const record = await prisma.records.findUnique({
      where: {
        id,
      },
      include: {
        categories: {
          select: {
            id: true,
          },
        },
      },
    });
    response.status(200).json(record);
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (
  request: TypedRequest<{
    name: string;
    content: string;
    typeId: number;
    categoriesId: number[];
  }>,
  response: Response,
  next: NextFunction
) => {
  try {
    const { name, content, typeId, categoriesId } = request.body;
    await prisma.records.create({
      data: {
        name,
        content: content || "Nothing here yet!",
        type: {
          connect: { id: typeId },
        },
        categories: {
          connect: categoriesId.map((categoryId) => {
            return {
              id: categoryId,
            };
          }),
        },
        created: new Date(),
        edited: new Date(),
      },
    });
    response.status(200).json({ message: "Successfully created record!" });
  } catch (error) {
    next(error);
  }
};

export const editRecord = async (
  request: TypedRequest<{
    name: string;
    content: string;
    typeId: number;
    categoriesId: number[];
  }>,
  response: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(request.params.id);
    const { name, content, typeId, categoriesId } = request.body;
    await prisma.records.update({
      where: {
        id,
      },
      data: {
        name,
        content,
        edited: new Date(),
        type: {
          connect: { id: typeId },
        },
        categories: {
          set: [],
          connect: categoriesId.map((categoryId) => {
            return { id: categoryId };
          }),
        },
      },
    });
    response.status(200).json({ message: "Successfully edited record!" });
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(request.params.id);
    await prisma.records.delete({
      where: {
        id,
      },
    });
    response.status(200).json({ message: "Successfully deleted record!" });
  } catch (error) {
    next(error);
  }
};
