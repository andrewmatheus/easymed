import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Doctor extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        number_crm: Sequelize.INTEGER,
        email: Sequelize.STRING,
        state: Sequelize.STRING,
        profession: Sequelize.STRING,
        situation: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default Doctor;
