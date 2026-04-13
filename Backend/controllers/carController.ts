import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Car from '../models/carModel';

// @desc Get all cars
export const getCars = asyncHandler(async (req: Request, res: Response) => {
    const cars = await Car.find({});
    res.json(cars);
});

// @desc Get car by ID
export const getCarById = asyncHandler(async (req: Request, res: Response) => {
    const car = await Car.findById(req.params.id);
    if (car) {
        res.json(car);
    } else {
        res.status(404);
        throw new Error('Car not found');
    }
});

// @desc Create a car
export const createCar = asyncHandler(async (req: Request, res: Response) => {
    const car = new Car(req.body);
    const createdCar = await car.save();
    res.status(201).json(createdCar);
});

// @desc Update a car
export const updateCar = asyncHandler(async (req: Request, res: Response) => {
    const car = await Car.findById(req.params.id);
    if (car) {
        Object.assign(car, req.body);
        const updatedCar = await car.save();
        res.json(updatedCar);
    } else {
        res.status(404);
        throw new Error('Car not found');
    }
});

// @desc Delete a car
export const deleteCar = asyncHandler(async (req: Request, res: Response) => {
    const car = await Car.findById(req.params.id);
    if (car) {
        await car.deleteOne();
        res.json({ message: 'Car removed' });
    } else {
        res.status(404);
        throw new Error('Car not found');
    }
});
