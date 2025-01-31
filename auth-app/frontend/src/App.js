import {BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Reset from "./pages/auth/Reset";
import Forgot from "./pages/auth/Forgot";
import Register from "./pages/auth/Register";

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
          <Route path="/register" element={
            <Register />
            }
          />
          <Route path="/forgot" element={
            <Forgot />
            }
          />
          <Route path="/resetPassword/:resetToken" element={
              <Reset />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
