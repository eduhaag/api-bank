import {Router} from 'express';

import accountsRouter from './AccountsRouter.js'

const routes = Router();

routes.use('/accounts', accountsRouter );

export default routes