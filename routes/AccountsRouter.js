import {Router} from 'express';

import {accountModel} from '../models/AccountModel.js';

const accountsRouter = Router();

// Criar Account
accountsRouter.post('/', async (req, res) =>{
  try {
    const account = new accountModel(req.body);
    const accountCreated = await account.save()

    return res.status(200).json(accountCreated);
  } catch (error) {
    return res.status(500).send(error)
  }
})

//Deposito
accountsRouter.patch('/deposite', async(req, res) =>{
  const {agency, account, depositeValue} = req.body;

  try {
    const newBalanceAccount = await accountModel.findOneAndUpdate({agency, account},{
      $inc:{
        balance: depositeValue
      }
    }, {new: true})

    if(!newBalanceAccount){
      return res.status(404).send('Account not find')
    }

    return res.status(200).json({newBalance: newBalanceAccount.balance})
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
});

//Saque
accountsRouter.patch('/withdraw', async(req, res) =>{
  const {agency, account, withdrawValue} = req.body;
  const withDrawCoast = 1

  try {
    const {_id, balance} = await accountModel.findOne({agency, account});

    if(!_id){
      return res.status(404).send('Account not find')
    };

    if(balance < withdrawValue){
      return res.status(400).send('There not suficients founds');
    }    

    const newBalance = await accountModel.findByIdAndUpdate({_id}, {
      $inc:{
        balance: -withdrawValue-withDrawCoast
      }
    }, {new:true})
    

    return res.status(200).json({newBalance: newBalance.balance})
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})

//saldo
accountsRouter.get('/', async(req, res)=>{
  let {agency, account} = req.query
  agency=parseInt(agency),
  account=parseInt(account)
  
  try {
    const value = await accountModel.findOne({agency,account});

    if(!value){
      return res.status(404).send('Account not find')
    }

    return res.status(200).json({balance: value.balance})
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})

//delete account
accountsRouter.delete('/:agency/:account', async (req,res)=>{
  let {agency, account} = req.params;
  agency=parseInt(agency);
  account = parseInt(account);

  try {
    const response = await accountModel.deleteOne({agency, account});
    if (response.deletedCount===0){
      return res.status(404).send('Account not find')
    }
    const activeAccounts = await accountModel.count({agency})

    return res.status(200).json({result: 'deleted', activeAccount: activeAccounts})
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }


})

//transference
accountsRouter.post('/transfer', async (req,res) => {
  const {origin, destine, value} = req.body
  const transferCoast = origin.agency!==destine.agency ? 8 : 0
  
  try {
    const originAccount = await accountModel.findOne({
      agency:origin.agency,
      account:origin.account
    });

    if(!originAccount) {
      return res.status(404).send('Origin account not find')
    }

    if(originAccount.balance<value) {
      return res.status(400).send('Origin account has not enought balance.')
    }

    const destineAccount = await accountModel.findOne({
      agency: destine.agency,
      account: destine.account
    })


    if(!destineAccount) {
      return res.status(404).send('Destine account not find')
    }

    const newBalance = await accountModel.findByIdAndUpdate({_id: originAccount._id}, {
      $inc: {
        balance: -value-transferCoast
      }
    },{new:true})

    await accountModel.findByIdAndUpdate({_id:destineAccount._id}, {
      $inc: {
        balance: value,
      }
    })

    return res.status(200).json({status: 'ok', originBalance: newBalance.balance})

  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})

//media saldo agencia 
accountsRouter.get('/media/:agency', async (req,res) =>{
  const {agency} = req.params
  try {
   const media = await accountModel.aggregate([
    {
      '$match': {
        'agency': parseInt(agency)
      }
    }, {
      '$group': {
        '_id': '$agency', 
        'media': {
          '$avg': '$balance'
        }
      }
    }
    ])
    return res.status(200).send(media)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }

})

//mais pobres
accountsRouter.get('/lessbalance/:results', async (req,res)=>{
  const numberResults = parseInt(req.params.results);

  try {
    const result = await accountModel.aggregate([
      {
        '$sort': {
          'balance': 1
        }
      }, {
        '$limit': numberResults
      }, {
        '$project': {
          'agency': 1, 
          'account': 1, 
          'balance': 1
        }
      }
    ]);

    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
  
})

//mais ricos 
accountsRouter.get('/morebalance/:results', async (req,res)=>{
  const numberResults = parseInt(req.params.results);

  try {
    const result = await accountModel.aggregate([
      {
        '$sort': {
          'balance': -1
        }
      }, {
        '$limit': numberResults
      }, {
        '$project': {
          'agency': 1, 
          'account': 1, 
          'balance': 1
        }
      }
    ]);

    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
  
})

//transfere contas 
accountsRouter.put('/transferaccounts', async (req, res) =>{
  const accounts = await accountModel.aggregate([
    {
      '$group': {
        '_id': '$agency', 
        'maximo': {
          '$max': '$balance'
        }, 
        'id': {
          '$first': '$_id'
        }
      }
    }
  ])
  const idsToChange = accounts.map(account=>{
    return account.id
  })


  await accountModel.updateMany({_id:{$in:idsToChange}},{
    agency: 99,
  })

  const accountPrivate = await accountModel.find({agency:99});

  return res.status(200).json(accountPrivate)
})
export default accountsRouter