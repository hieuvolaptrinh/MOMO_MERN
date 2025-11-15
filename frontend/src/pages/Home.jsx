import BannerSlider from "../components/BannerSlider";
import BrandSections from "../components/BrandSections";
import NewArrivals from "../components/NewArrivals";
import Promotions from "../components/Promotions";
import Brands from "../components/Brands";
import RegistrationForm from "../components/RegistrationForm";

export default function Home(){

  return (
    <div className="bg-gray-50">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Brand Sections */}
      <BrandSections />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Promotions */}
      <Promotions />

      {/* Brands */}
      <Brands />

      {/* Registration Form */}
      <RegistrationForm />
    </div>
  );
}
