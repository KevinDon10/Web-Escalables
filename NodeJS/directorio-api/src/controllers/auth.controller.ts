import {type Request, type Response} from "express";
import {UserModel} from "../models/user.model.ts";
import {generateJWT} from "../helpers/jwt.helper.ts";

export const login = async (req: any, res: any) => {  

    const {username, password} = req.body;

    try{
        const user = await UserModel.findOne({username});

        if(!user)
        {
            return res.status(401).json({
                ok: false,
                msg: "Datos inválidos",
            });
        }

        //validar la contraseña
        if(password !== user.password)
        {
            return res.status(401).json({
                ok: false,
                msg: "Datos inválidos",
            });
        }

        const token = await generateJWT(user.id.toString()); 

        res.status(200).json({
            ok: true,
            msg: "Login exitoso",
            token,
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno del servidor",
        });
    }
}