import axios from 'axios';

require('dotenv/config');

class SearchDoctorService {
  async run({ number_crm, state }) {
    const hostname = 'https://www.consultacrm.com.br/api/index.php';
    const tipo = process.env.TIPOAPI;
    const chaveAPI = process.env.CHAVEAPI;
    const destino = process.env.DESTINOAPI;
    const path = `?tipo=${tipo}&uf=${state}&q=${number_crm}&chave=${chaveAPI}&destino=${destino}`;

    const apiResponse = await axios.get(`${hostname}${path}`);

    return apiResponse.data;
  }
}

export default new SearchDoctorService();
