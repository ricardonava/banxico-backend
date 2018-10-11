const soap = require('soap');
const { parseString } = require('xml2js');
const express = require('express');

const url = 'http://www.banxico.org.mx/DgieWSWeb/DgieWS?WSDL';

const expressRoutes = (parseResult) => {
  const exchangeArray = parseResult.CompactData['bm:DataSet'][0]['bm:Series'];

  const currencies = {};

  ['EUR', 'CAD', 'USDFix', 'GBP', 'YPN', 'USD'].map((item, index) => {
    currencies[item] = {
      valor: exchangeArray[index]['bm:Obs'][0].$.OBS_VALUE,
      descripcion: exchangeArray[index].$.TITULO,
      periodo: exchangeArray[index]['bm:Obs'][0].$.TIME_PERIOD,
      serie: exchangeArray[index].$.IDSERIE,
    };
  });

  const app = express();

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.get('/', (req, res) => res.json(currencies));

  app.listen(3005, () => console.log('Example app listening on port 3005!'));
  // app.listen(process.env.PORT);
};

const parseXML = (xml) => {
  parseString(xml, (err, parseResult) => {
    expressRoutes(parseResult);
  });
};

const clientValues = (WSDLClient) => {
  WSDLClient.DgieWS.DgieWSPort.tiposDeCambioBanxico(null, (err, result) => {
    parseXML(result.result.$value);
  });
};

const currencySource = () => {
  soap.createClient(url, (err, WSDLClient) => {
    clientValues(WSDLClient);
  });
};

currencySource(url);
