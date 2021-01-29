import {Router} from 'express';

import accountsRouter from './AccountsRouter.js'

const routes = Router();

routes.use('/accounts', accountsRouter );

routes.get('/', (req,res)=>{
  return res.json({mesage: 'ok'})
})

export default routes