import * as Yup from 'yup';

import Doctor from '../models/Doctor';
import File from '../models/File';

import SearchDoctorService from '../services/SearchDoctorService';

class DoctorController {
  async store(req, res) {
    const schema = Yup.object().shape({
      number_crm: Yup.number().required(),
      state: Yup.string().max(2).required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const doctorExists = await Doctor.findOne({
      where: { email: req.body.email },
    });

    if (doctorExists) {
      return res.status(400).json({ error: 'Doctor already exists.' });
    }

    const { number_crm, state, email, password } = req.body;
    let { name, profession, situation } = '';

    const searchDoctor = await SearchDoctorService.run({
      number_crm,
      state,
    });

    if (!(searchDoctor.item.length > 0)) {
      return res.status(400).json({ error: 'CRM not found, contact us!' });
    }

    name = searchDoctor.item[0].nome;
    profession = searchDoctor.item[0].profissao;
    situation = searchDoctor.item[0].situacao;

    const { id } = await Doctor.create({
      name,
      number_crm,
      password,
      email,
      state,
      profession,
      situation,
    });

    return res.json({
      id,
      name,
      number_crm,
      email,
      state,
      profession,
      situation,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email(),
      state: Yup.string().required(),
      number_crm: Yup.number().required(),
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

    const { email, state, number_crm, oldPassword } = req.body;

    const doctor = await Doctor.findByPk(req.userId);

    if (number_crm !== doctor.number_crm) {
      const doctorExists = await Doctor.findOne({ where: { number_crm } });

      if (doctorExists) {
        return res.status(400).json({ error: 'CRM already exists.' });
      }
    }

    if (oldPassword && !(await doctor.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    let { name, profession, situation } = '';

    const searchDoctor = await SearchDoctorService.run({
      number_crm,
      state,
    });

    if (!(searchDoctor.item.length > 0)) {
      return res.status(400).json({ error: 'CRM not found, contact us!' });
    }

    name = searchDoctor.item[0].nome;
    profession = searchDoctor.item[0].profissao;
    situation = searchDoctor.item[0].situacao;

    await doctor.update({
      name,
      email,
      number_crm,
      state,
      profession,
      situation,
    });

    const { id, avatar } = await Doctor.findByPk(req.userId, {
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
      state,
      email,
      profession,
      situation,
      avatar,
    });
  }
}

export default new DoctorController();
