import mongoose from 'mongoose';

const accountSchemma = mongoose.Schema({
  name: {
    type: String
  },
  agency: {
    type: Number,
    require: true
  },
  account: {
    type: Number,
    require: true
  },
  balance: {
    type: Number,
    require: true,
    min: 0,
    default: 0
  }
});

const accountModel = mongoose.model('account', accountSchemma);

export {accountModel}