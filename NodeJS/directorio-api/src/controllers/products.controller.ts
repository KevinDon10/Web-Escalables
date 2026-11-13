import {type Request, type Response} from "express";

const result = [

    "Producto1",
    "Producto2",
];

export const getProducts = (req: Request, res: Response) => 
{

  res.status(200).json(result);

};
