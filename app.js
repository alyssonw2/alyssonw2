let dispositivoSelecionado;
let characteristicSelecionada;

async function listarDispositivos() {
  try {
    const dispositivos = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true
    });
    dispositivos.forEach(async (dispositivo) => {
      const item = document.createElement('li');
      item.textContent = dispositivo.name;
      item.addEventListener('click', async () => {
        await connectToDevice(dispositivo);
      });
      document.getElementById('dispositivos').appendChild(item);
    });
  } catch (erro) {
    console.error('Erro ao listar dispositivos Bluetooth:', erro);
  }
}

async function connectToDevice(dispositivo) {
  try {
    const server = await dispositivo.gatt.connect();
    dispositivoSelecionado = dispositivo;
    mostrarInfoDispositivo(server);
  } catch (erro) {
    console.error('Erro ao conectar com dispositivo Bluetooth:', erro);
  }
}

function mostrarInfoDispositivo(server) {
  document.getElementById('info-dispositivo').style.display = 'block';
  document.getElementById('nome-dispositivo').textContent = dispositivoSelecionado.name;
  document.getElementById('id-dispositivo').textContent = dispositivoSelecionado.id;
  dispositivoSelecionado.gatt.connect().then(server => {
    const services = server.getPrimaryServices();
    services.then(pServices => {
      let servicePromises = [];
      pServices.forEach(pService => {
        servicePromises.push(getServiceCharacteristics(pService));
      });
      Promise.all(servicePromises).then(result => {
        const uuids = result.filter(uuid => uuid).join(', ');
        document.getElementById('gatt-servicos').textContent = uuids;
      });
    });
  });
}

async function getServiceCharacteristics(service) {
  let uuids = [];
  try {
    const characteristics = await service.getCharacteristics();
    characteristics.forEach(characteristic => {
      uuids.push(characteristic.uuid);
      // adicione um evento para receber notificações de mudanças de valor nesta característica
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      characteristic.startNotifications();
    });
  } catch (error) {
    console.error('Erro ao obter características do serviço:', error);
  }
  return uuids.join(', ');
}

function handleCharacteristicValueChanged(event) {
  const value = event.target.value;
  // faça algo com o valor recebido
  alert('Valor recebido:', value);
}



async function onButtonClick() {
  let filters = [];

  let filterName = document.querySelector('#name').value;
  if (filterName) {
    filters.push({name: filterName});
  }

  let filterNamePrefix = document.querySelector('#namePrefix').value;
  if (filterNamePrefix) {
    filters.push({namePrefix: filterNamePrefix});
  }

  let options = {};
  if (document.querySelector('#allAdvertisements').checked) {
    options.acceptAllAdvertisements = true;
  } else {
    options.filters = filters;
  }

  try {
    log('Requesting Bluetooth Scan with options: ' + JSON.stringify(options));
    const scan = await navigator.bluetooth.requestLEScan(options);

    log('Scan started with:');
    log(' acceptAllAdvertisements: ' + scan.acceptAllAdvertisements);
    log(' active: ' + scan.active);
    log(' keepRepeatedDevices: ' + scan.keepRepeatedDevices);
    log(' filters: ' + JSON.stringify(scan.filters));

    navigator.bluetooth.addEventListener('advertisementreceived', event => {
      log('Advertisement received.');
      log('  Device Name: ' + event.device.name);
      log('  Device ID: ' + event.device.id);
      log('  RSSI: ' + event.rssi);
      log('  TX Power: ' + event.txPower);
      log('  UUIDs: ' + event.uuids);
      event.manufacturerData.forEach((valueDataView, key) => {
        logDataView('Manufacturer', key, valueDataView);
      });
      event.serviceData.forEach((valueDataView, key) => {
        logDataView('Service', key, valueDataView);
      });
    });

    setTimeout(stopScan, 10000);
    function stopScan() {
      log('Stopping scan...');
      scan.stop();
      log('Stopped.  scan.active = ' + scan.active);
    }
  } catch(error)  {
    log('Argh! ' + error);
  }
}

/* Utils */

const logDataView = (labelOfDataSource, key, valueDataView) => {
  const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
    return b.toString(16).padStart(2, '0');
  }).join(' ');
  const textDecoder = new TextDecoder('ascii');
  const asciiString = textDecoder.decode(valueDataView.buffer);
  log(`  ${labelOfDataSource} Data: ` + key +
      '\n    (Hex) ' + hexString +
      '\n    (ASCII) ' + asciiString);
};
