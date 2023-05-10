navigator.bluetooth.requestDevice({
  acceptAllDevices: true
})
.then(dispositivo => {
  const item = document.createElement('li');
  item.textContent = dispositivo.name;
  item.addEventListener('click', () => {
      dispositivo.gatt.connect()
      .then(server => {
          dispositivoSelecionado = dispositivo;
          mostrarInfoDispositivo();
      });
  });
  document.getElementById('dispositivos').appendChild(item);
})
.catch(erro => {
  console.error('Erro ao listar dispositivos Bluetooth:', erro);
});
