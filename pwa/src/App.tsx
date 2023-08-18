import "./App.css";
import { Route, Routes } from "react-router-dom";
import CreateCheese from "./components/supplier/createCheese";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<CreateCheese />} />
      </Routes>
    </>
  );
}

export default App;
