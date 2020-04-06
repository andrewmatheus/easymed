import Sequelize from 'sequelize';
//import mongoose from 'mongoose';

import Doctor from '../app/models/Doctor';
import File from '../app/models/File';

import databaseConfig from '../config/database';

const models = [Doctor, File];

class Database {
  constructor() {
    this.init();
  //  this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }

 /**  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
  }
  */
}

export default new Database();
