import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ModalProvider, Modal } from "../context/Modal";
import { thunkAuthenticate } from "../redux/session";
import Navigation from "../components/Navigation/Navigation";
import Footer from "../components/Footer";

export default function Layout() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(thunkAuthenticate());
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <ModalProvider>
        <Navigation />
        <div className="page-container">
          <Outlet />
        </div>
        <Footer />
        <Modal />
      </ModalProvider>
    </>
  );
}
