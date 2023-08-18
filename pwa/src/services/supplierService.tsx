import httpService from "./httpService";
const apiEndpoint = "channels/my-channel1/chaincodes/chaincode1";

function createCheese(data: any, privateKey: any) {
  return httpService.post(apiEndpoint, {
    peers: ["peer0.org1.example.com"],
    fcn: "createToken",
    args: [data],
    privateKey,
  });
}

const SupplierService = { createCheese };

export default SupplierService;
