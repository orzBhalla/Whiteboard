import prisma from '../lib/prisma.js'

const CANVAS_LIST_SELECT = {
    id: true,
    name: true,
    thumbnail: true,
    createdAt: true,
    updatedAt: true,
    owner: { select: { id: true, name: true } }
}

export const findAllOwnedByUser = (userId, page) => {
    const skip = (page - 1) * 10
    return prisma.canvas.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: 10,
        select: CANVAS_LIST_SELECT
    })
}

export const findAllSharedWithUser = (userId, page) => {
    const skip = (page - 1) * 10
    return prisma.canvas.findMany({
        where: { shares: { some: { userId } } },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: 10,
        select: CANVAS_LIST_SELECT
    })
}

export const countOwnedByUser = (userId) => {
    return prisma.canvas.count({ where: { ownerId: userId } })
}

export const countSharedWithUser = (userId) => {
    return prisma.canvas.count({ where: { shares: { some: { userId } } } })
}

export const findById = (id) => {
    return prisma.canvas.findUnique({
        where: { id },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            shares: {
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }
        }
    })
}

export const createCanvas = (name, ownerId) => {
    return prisma.canvas.create({
        data: { name, ownerId, elements: [] }
    })
}

export const updateCanvas = (id, data) => {
    return prisma.canvas.update({
        where: { id },
        data
    })
}

export const deleteCanvas = (id) => {
    return prisma.canvas.delete({ where: { id } })
}

export const findShare = (canvasId, userId) => {
    return prisma.canvasShare.findFirst({
        where: { canvasId, userId }
    })
}

export const createShare = (canvasId, userId) => {
    return prisma.canvasShare.create({
        data: { canvasId, userId }
    })
}

export const deleteShare = (canvasId, userId) => {
    return prisma.canvasShare.deleteMany({
        where: { canvasId, userId }
    })
}