import * as Yup from 'yup';

import Doctor from '../models/Doctor';
import File from '../models/File';

import SearchDoctorService from '../services/SearchDoctorService';

class DoctorController {
  async store(req, res) {
    const schema = Yup.object().shape({
      number_crm: Yup.number().required(),
      state: Yup.string().max(2).required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const doctorExists = await Doctor.findOne({ where: { email: req.body.email } });

    if (doctorExists) {
      return res.status(400).json({ error: 'Doctor already exists.' });
    }

    const { number_crm, state, email } =  req.body;

    const searchDoctor = await SearchDoctorService.run({
      number_crm,
      state,
    })

    const { name, profession, situation } = searchDoctor.body;

    const doctorCreate = await Doctor.create({
      name, number_crm, email, state, profession, situation
    });

    return res.json({
      doctorCreate
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldpassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldpassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, oldPassword } = req.body;

    const user = await Doctor.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await Doctor.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    await user.update(req.body);

    const { id, name, avatar } = await Doctor.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new DoctorController();
