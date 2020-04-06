import request from 'request';

require('dotenv/config');

class SearchDoctorService {
  async run({ number_crm, state }) {
    const hostname = 'https://www.consultacrm.com.br/api/index.php';
    const tipo = process.env.TIPOAPI;
    const chaveAPI = process.env.CHAVEAPI;
    const destino = process.env.DESTINOAPI;
    const path = `?tipo=${tipo}&uf=${state}&q=${number_crm}&chave=${chaveAPI}&destino=${destino}`;
    console.log(path);
    let data = '';
    try {
      request(`${hostname}${path}`, (err, res, body) => {
        console.log(err);
        console.log(body);
        data = body;
      });
    } catch (error) {
      throw new Error("Problem with the search!");
    }

    return data;
  }
}

export default new SearchDoctorService();

