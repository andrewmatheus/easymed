import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import DoctorController from './app/controllers/DoctorController';
import FileController from './app/controllers/FileController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middleware/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/doctors', DoctorController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
