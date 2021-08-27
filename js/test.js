require("dotenv").config();

const { createBluetooth } = require("node-ble");
const {
  TEST_DEVICE,
} = process.env;

async function main() {
  const { bluetooth, destroy } = createBluetooth();

  // get bluetooth adapter
  const adapter = await bluetooth.defaultAdapter();
  await adapter.startDiscovery();
  console.log("discovering");
  console.log(await adapter.devices());

  //while(true) {
  //await new Promise(resolve=>setTimeout(resolve,1000))
  //console.log( await adapter.devices())
  //}

  // get device and connect
  const device = await adapter.waitDevice(TEST_DEVICE);
  console.log("got device", await device.getAddress(), await device.getName());
  await device.connect();
  console.log("connected");

  const gattServer = await device.gatt();

  // read write characteristic
  const services = await gattServer.services();
  console.log("services", services);
  for (const service of services) {
    if (service === '00001801-0000-1000-8000-00805f9b34fb') continue
    const service1 = await gattServer.getPrimaryService(service);
    console.log("service", service, await service1.toString());
    const characteristics = await service1.characteristics();
    console.log("characteristics", characteristics);
    for (const characteristic of characteristics) {
      const characteristic1 = await service1.getCharacteristic(characteristic);
      console.log(
        "characteristic",
        characteristic,
        await characteristic1.toString()
      );
      // await characteristic1.writeValue(Buffer.from('Hello world'))
      const buffer = await characteristic1.readValue();
      console.log("read", buffer, buffer.toString());
    }
  }

  // subscribe characteristic
  // const service2 = await gattServer.getPrimaryService(TEST_NOTIFY_SERVICE)
  // const characteristic2 = await service2.getCharacteristic(TEST_NOTIFY_CHARACTERISTIC)
  // await characteristic2.startNotifications()
  // await new Promise(done => {
  //   characteristic2.once('valuechanged', buffer => {
  //     console.log('subscription', buffer)
  //     done()
  //   })
  // })

  // await characteristic2.stopNotifications()
  destroy();
}

main().then(console.log).catch(console.error);
