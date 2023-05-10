let dispositivoSelecionado;

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
    mostrarInfoDispositivo();
  } catch (erro) {
    console.error('Erro ao conectar com dispositivo Bluetooth:', erro);
  }
}

function mostrarInfoDispositivo() {
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
    });
  } catch (error) {
    console.error('Erro ao obter características do serviço:', error);
  }
  return uuids.join(', ');
}


