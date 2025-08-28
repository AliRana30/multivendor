import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Home from "./pages/Home";
import BestSelling from "./pages/BestSelling";
import Events from "./pages/Events";
import FAQ from "./pages/FAQ";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Layout/Header";
import Navbar from "./Layout/Navbar";
import Footer from "./Layout/Footer";
import Products from "./pages/Products/Products";
import ProductDetails from "./pages/Products/ProductDetails";
import ProductsCategory from "./pages/Products/ProductsCategory";
import ProfilePage from "./Profile/ProfilePage";
import ShopCreate from "./Shop/ShopCreate";
import ActivationPage from "./pages/Activation/ActivationPage";
import SellerActivationPage from "./pages/Activation/SellerActivationPage";
import ShopLogin from "./Shop/ShopLogin";
import api from "./components/axiosCongif";
import ShopHome from "./Shop/ShopHome";
import ShopDashboard from "./Shop/ShopDashboard";
import ShopCreateProduct from "./Shop/ShopCreateProduct";
import ShopAllProducts from "./Shop/ShopAllProducts";
import ShopCreateEvent from "./Shop/ShopCreateEvent";
import ShopAllEvents from "./Shop/ShopAllEvents";
import ShopAllCoupons from "./Shop/ShopAllCoupons";
import ShopCreateCoupon from "./Shop/ShopCreateCoupon";
import { ToastContainer } from "react-toastify";
import CheckOut from "./pages/CheckOut";
import ShopAllOrders from "./Shop/ShopAllOrders";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import ShopSettings from "./Shop/ShopSettings";
import ShopWithdrawMoney from "./Shop/ShopWithdrawMoney";
import ShopMessages from "./Shop/ShopMessages";
import ConversationDetailsPage from "./pages/ConversationDetailsPage";
import MessageChat from "./Shop/ShopComponents/MessageChat";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminAllUsersPage from "./Admin/pages/AdminAllUsersPage";
import AdminAllSellersPage from "./Admin/pages/AdminAllSellersPage";
import AdminAllOrdersPage from "./Admin/pages/AdminAllOrdersPage";
import AdminAllProductsPage from "./Admin/pages/AdminAllProductsPage";
import AdminAllEventsPage from "./Admin/pages/AdminAllEventsPage";
import AdminDashboardWithdraw from "./Admin/AdminDashboardWithdraw";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const {isSeller} = useSelector((state) => state.seller)

  const getCurrentUser = async () => {
    try {
      const res = await api.get("/get-user", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      dispatch({ type: "LoadUserSuccess", payload: res.data.user });
    } catch (error) {
      console.error("Error fetching user:", error);
      dispatch({ type: "LoadUserFail", payload: error.message });
    }
  };

  const getCurrentSeller = async () => {
    try {
      const res = await api.get("/get-seller", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      dispatch({ type: "LoadSellerSuccess", payload: res.data.seller });
    } catch (error) {
      console.error("Error fetching Seller:", error);
      dispatch({ type: "LoadSellerFail", payload: error.message });
      toast.error("Error while getting current user");
    }
  };

  useEffect(() => {
    getCurrentUser();
    getCurrentSeller()

    if(isSeller === true){
    navigate("/shop")
      }

  }, []);

  const location = useLocation();
  return (
    <>
      <div>
        <ToastContainer/>
        {/*Header*/}
        {location.pathname.startsWith("/login") ||
        location.pathname.startsWith("/signup") || location.pathname.startsWith("/create-shop") ||
        location.pathname.startsWith("/shop")  ||
        location.pathname.startsWith("/dashboard") ? (
          ""
        ) : (
          <Header />
        )}

        {/*Navbar*/}
        {location.pathname.startsWith("/login") ||
        location.pathname.startsWith("/signup") || location.pathname.startsWith("/create-shop") ||
        location.pathname.startsWith("/shop") ||
        location.pathname.startsWith("/dashboard") ? (
          ""
        ) : (
          <Navbar />
        )}
      </div>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/activation/:activation_token" element={<ActivationPage />}/>

        <Route path="/product/:category" element={<ProductsCategory />} />
        <Route path="/best-selling" element={<BestSelling />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:name" element={<ProductDetails />} />
        <Route path="/events" element={<Events />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/checkout" element={<CheckOut/>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
        <Route path="/conversation/:id" element={<ConversationDetailsPage />} />

        {/*Shop Routes*/}
        <Route path="/seller/activation/:activation_token" element={<SellerActivationPage/>}/>
        <Route path="/shop-login" element={<ShopLogin />} />
        <Route path="/create-shop" element={<ShopCreate />} />
        <Route path="/shop/:id" element={<ShopHome />} />
        <Route path="/shop-dashboard" element={<ShopDashboard />} />
        <Route path="/shop-dashboard/create-product" element={<ShopCreateProduct />} />
        <Route path="/shop-dashboard/all-products" element={<ShopAllProducts />} />
        <Route path="/shop-dashboard/event-create" element={<ShopCreateEvent/>} />
        <Route path="/shop-dashboard/all-events" element={<ShopAllEvents />} />
        <Route path="/shop-dashboard/create-coupon" element={<ShopCreateCoupon />} />
        <Route path="/shop-dashboard/all-coupons" element={<ShopAllCoupons />} />
        <Route path="/shop-dashboard/all-orders" element={<ShopAllOrders />} />
        <Route path="/shop-dashboard/withdraw-money" element={<ShopWithdrawMoney />} />
        <Route path="/shop-dashboard/messages" element={<ShopMessages />} />
        <Route path="/shop-dashboard/messages/:conversationId" element={<MessageChat />} />

        {/*Admin Routes*/}
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path="/admin/all-users" element={<AdminAllUsersPage/>} />
        <Route path="/admin/all-sellers" element={<AdminAllSellersPage/>} />
        <Route path="/admin/all-orders" element={<AdminAllOrdersPage/>} />
        <Route path="/admin/all-products" element={<AdminAllProductsPage/>} />
        <Route path="/admin/all-events" element={<AdminAllEventsPage/>} />
        <Route path="/admin/withdraw-requests" element={<AdminDashboardWithdraw/>} />

      </Routes>

      {/*Footer*/}
      {location.pathname.startsWith("/login") ||
      location.pathname.startsWith("/signup") || location.pathname.startsWith("/create-shop") ||
        location.pathname.startsWith("/shop") ||
        location.pathname.startsWith("/dashboard")? (
        ""
      ) : (
        <Footer />
      )}
    </>
  );
}

export default App;
