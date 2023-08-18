import { useState } from "react";

import FormButton from "../../common/formButton";
import Input from "../../common/input";
import SupplierService from "../../services/supplierService";

function CreateCheese() {
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const [cheeseName, setCheeseName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productionDate, setProductionDate] = useState("");

  const [cheeseId, setCheeseId] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoader(true);
    setError(false);
    setSuccess(true);
  };

  const sendRequest = async (key: any) => {
    try {
      let cheeseData = {
        cheeseName,
        manufacturer,
        quantity,
        productionDate: new Date().toISOString(),
      };

      console.log("cheeseData: ", cheeseData);

      const res = await SupplierService.createCheese(cheeseData, key);

      console.log("response: ", res.data);
      setLoader(false);

      if (res.data.success) {
        setError(false);
        setSuccess(true);
        setCheeseId(res.data.message.result);
      } else {
        setSuccess(true);
        setError(res.data.error.message);
      }
    } catch (error) {
      setLoader(false);
      setSuccess(false);
      setError(false);
      console.log(error);
    }
  };

  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900 min-h-[93vh] py-10">
        <div className="flex flex-col items-center justify-center px-6 mx-auto lg:py-0">
          <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <h2 className="mb-1 text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create Cheese
            </h2>
            <form
              className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
              onSubmit={(e) => handleSubmit(e)}
            >
              <Input
                label="Cheese Name"
                type="text"
                id="cheeseName"
                required
                value={cheeseName}
                onChange={setCheeseName}
              />

              <Input
                label="Manufacturer"
                type="text"
                id="manufacturer"
                required
                value={manufacturer}
                onChange={setManufacturer}
              />

              <Input
                label="Quantity (in kg)"
                type="number"
                id="quantity"
                required
                value={quantity}
                onChange={setQuantity}
              />

              <Input
                label="Production Date"
                type="date"
                id="productionDate"
                required
                value={productionDate}
                onChange={setProductionDate}
              />

              {error ? (
                <div className="text-red-500 text-sm text-center  ">
                  {error}
                </div>
              ) : null}
              {success ? (
                <>
                  <div className="text-green-500 text-sm text-center  ">
                    {success}
                  </div>
                  <div className="text-gray-50 text-md text-center  ">
                    Cheese ID: {cheeseId}
                  </div>
                </>
              ) : null}

              <FormButton name="Submit" loader={loader} />
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
export default CreateCheese;
