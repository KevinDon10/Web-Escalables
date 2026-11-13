import {type Request, type Response} from "express";
import {PersonModel} from "../models/person.model.ts";


export const getPersons = async (req: Request, res: Response) => 
{
    const {searchTerm} = req.query;

    let query = {};

    if(searchTerm && typeof searchTerm === "string")
    {
        query = {
            $or: [
                {name: {$regex: searchTerm, $options: "i"}},
                {username: {$regex: searchTerm, $options: "i"}},
            ]
        };
    }

    try{
        const persons = await PersonModel.find(query);
        res.status(200).json(persons);
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error al obtener los datos",
        });
    }
};

export const getPersonById = async (req: Request, res: Response) =>
{
    const {id} = req.params;

    try{
        const person = await PersonModel.findById(id);

        if(!person)
        {
            return res.status(404).json({
                ok: false,
                msg: "Elemento no encontrado",
            });
        }

        res.status(200).json(person);

    }catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error al obtener el elemento",
        });
    }
}

export const createPersons = async (req: Request, res: Response) =>
{
    const {name, username, email, image} = req.body;

    if(!name || !username || !email || !image)
    {
        return res.status(400).json({
            msg: "Datos invalidos",
        });
    }

    try{
        const newperson = new PersonModel({name, username, email, image});

        await newperson.save();

        res.status(201).json({
            ok: true,
            msg: "Elemento creado con exito",
            data: newperson
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error al crear el elemento",
        });
    }
};

export const updatePersons = async (req: Request, res: Response) =>
{
    const {id} = req.params;

    const {name, username, email, image} = req.body;

    if(!name || !username || !email || !image)
    {
        return res.status(400).json({
            msg: "Datos invalidos",
        });
    }

    try{
        const updatedPerson = await PersonModel.findByIdAndUpdate(id, {name, username, email, image}, {new: true});

        if(!updatedPerson)
        {
            return res.status(404).json({
                ok: false,
                msg: "Elemento no encontrado",
            });
        }

        res.status(200).json({
            ok: true,
            msg: "Elemento actualizado con éxito",
            data: updatedPerson
        });

    }catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error al actualizar el elemento",
        });
    }
};

export const deletePersons = async(req: Request, res: Response) =>
{
    const {id} = req.params;

    try{
        const deletedCount = await PersonModel.deleteOne({ _id: id });

        if(deletedCount.deletedCount > 0) {
            return res.status(200).json({
                ok: true,
                msg: "Elemento eliminado con éxito",
            })

        }else {
            res.status(404).json({
                ok: false,
                msg: "Elemento no encontrado",
            })
        }

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error al eliminar el elemento",
        });
    }
};

export const migratePersons = (req: Request, res: Response) =>
{
    res.status(200).json({
        result: "Elementos migrados con éxito",
    });
}