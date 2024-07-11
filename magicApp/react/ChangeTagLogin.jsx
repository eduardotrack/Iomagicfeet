
import style from "./styles.css";
const ChangeTagLogin = () => {

      if (window.location?.pathname === '/login') {
        return <h1 className={`${style.titleLogin}`}>Faça seu Login</h1>;
      }


    return <></>;
}

export default ChangeTagLogin;
