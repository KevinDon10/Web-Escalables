import express, { type Application } from 'express';
import cors from 'cors';
import notasRoutes from '../routes/notas.routes.ts';
import { dbConnection } from '../database/config.ts';

export class Server {
    private app: Application;
    private port: string;
    private apiPaths = { notas: '/api/notas' };

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '8080';
        this.conectarDB();
        this.middlewares();
        this.routes();
    }

    private middlewares(): void {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private routes(): void {
        this.app.use(this.apiPaths.notas, notasRoutes);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`Servidor escuchando el puerto ${this.port}`);
        });
    }

    private async conectarDB(): Promise<void> {
        await dbConnection();
    }
}
