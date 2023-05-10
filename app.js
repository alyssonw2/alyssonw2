let dispositivoSelecionado;

async function listarDispositivos() {
  try {
    const dispositivos = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true
    });
    dispositivos.forEach((dispositivo) => {
      const item = document.createElement('li');
      item.textContent = dispositivo.name;
      item.addEventListener('click', async () => {
        dispositivoSelecionado = await navigator.bluetooth.requestDevice({
          filters: [{ name: dispositivo.name }]
        });
        mostrarInfoDispositivo();
      });
      document.getElementById('dispositivos').appendChild(item);
    });
  } catch (erro) {
    console.error('Erro ao listar dispositivos Bluetooth:', erro);
  }
}

function mostrarInfoDispositivo() {
  document.getElementById('info-dispositivo').style.display = 'block';
  document.getElementById('nome-dispositivo').textContent = dispositivoSelecionado.name;
  document.getElementById('id-dispositivo').textContent = dispositivoSelecionado.id;
  document.getElementById('gatt-servicos').textContent = dispositivoSelecionado.gatt.services.map((servico) => servico.uuid).join(', ');
}

listarDispositivos();
