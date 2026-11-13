import jwt from "jsonwebtoken";

export const generateJWT = (uid: string): Promise<string> =>
{
    return new Promise((resolve, reject) =>
    {
        const payload = {uid};
        const secret = process.env.JWT_SECRERT;

        if(!secret)
        {
            reject("No se ha definido un valor para JWT_SECRET");
            return;
        }

        jwt.sign(payload, secret, { expiresIn: '4h' }, (error, token) =>
        {
            if (error)
            {
                console.log(error);
                reject("Error al generar el token");
            }
            else
            {
                resolve(token!);
            }
        });
    });
}