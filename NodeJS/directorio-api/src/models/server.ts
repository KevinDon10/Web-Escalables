import express, {type Application} from "express";
import cors from "cors";
import personsRoutes from "../routes/persons.routes.ts";
import productRoutes from "../routes/products.route.ts";
import authRoutes from "../routes/auth.routes.ts";
import {dbConnection} from "../database/config.ts";

export class Server
{
    private app: Application;
    private port: string;
    private apiPaths = {
        persons: "/api/persons",
        products: "/api/products",
        auth: "/api/auth"
    };

    constructor()
    {
        this.app = express();
        this.port = process.env.PORT || "8080";

        this.conectarDB();

        this.middlewares();
        this.routes();
    }

    private middlewares(): void
    {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private routes(): void
    {
        this.app.use(this.apiPaths.persons, personsRoutes);
        this.app.use(this.apiPaths.products, productRoutes);
        this.app.use(this.apiPaths.auth, authRoutes);
    }

    public listen(): void
    {
        this.app.listen(this.port, () =>
        {
            console.log(`Servidor escuchando el puerto ${this.port}`);
        });
    }

    private async conectarDB()
    {
        await dbConnection();
    }
}