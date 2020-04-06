import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import Auth from '../../config/auth';
import Doctor from '../models/Doctor';
import File from '../models/File';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      number_crm: Yup.number().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { number_crm, password } = req.body;

    const doctor = await Doctor.findOne({
      where: { number_crm },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!doctor) {
      return res.status(401).json({ error: 'doctor not found' });
    }

    if (!(await doctor.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, avatar } = doctor;

    return res.json({
      doctor: {
        id,
        name,
        number_crm,
        avatar,
      },
      token: jwt.sign({ id }, Auth.secret, {
        expiresIn: Auth.expiresIn,
      }),
    });
  }
}

export default new SessionController();
