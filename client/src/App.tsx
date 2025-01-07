import { Outlet, useNavigate } from "react-router-dom";
import { setNavigate } from "./lib/navigation";

const App = () => {
  const navigate = useNavigate();
  setNavigate(navigate);

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default App;
