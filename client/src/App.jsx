import { BrowserRouter, Route, Routes } from "react-router-dom";
import Blogs from "./components/Blogs";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ResetPassword from "./components/ResetPassword";


function App() {
  return (
    <div className="">
     
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Blogs/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/signup' element={<Signup/>}/>
            <Route path='/dashboard' element={<Dashboard/>}/>
            <Route path='/reset-password/:token' element={<ResetPassword/>}/>
        </Routes>
     
      </BrowserRouter>
    </div>
  );
}

export default App;
