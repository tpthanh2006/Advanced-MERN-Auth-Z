import {BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
              <Home />
            }
          /> 
          <Route path="/login" element={
            <Login />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
